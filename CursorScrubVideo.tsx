/**
 * CursorScrubVideo — Framer Code Component
 *
 * Scrubs a video's playhead based on cursor position.
 *
 * IMPORTANT — Frame-accurate scrubbing requires every frame to be a keyframe.
 * Encode your source video with:
 *
 *   ffmpeg -i in.mp4 -c:v libx264 -preset slow -crf 18 -g 1 -keyint_min 1 \
 *     -x264-params "scenecut=0" -profile:v high -pix_fmt yuv420p \
 *     -movflags +faststart -an out.mp4
 */

import { addPropertyControls, ControlType } from "framer"
import { useEffect, useRef } from "react"

interface Props {
    videoFile?: string
    axis?: "horizontal" | "vertical"
    reverse?: boolean
    trackingArea?: "component" | "window"
    smoothing?: number
    objectFit?: "cover" | "contain" | "fill"
    showPoster?: boolean
    borderRadius?: number
}

export default function CursorScrubVideo({
    videoFile,
    axis = "horizontal",
    reverse = false,
    trackingArea = "component",
    smoothing = 0.22,
    objectFit = "cover",
    showPoster = true,
    borderRadius = 0,
}: Props) {
    const rootRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const rafRef = useRef<number>(0)
    const targetTimeRef = useRef(0)
    const currentTimeRef = useRef(0)
    const seekingRef = useRef(false)
    const readyRef = useRef(false)

    useEffect(() => {
        if (!videoFile) return
        const video = videoRef.current
        const root = rootRef.current
        if (!video || !root) return

        // Prime the buffer
        video.load()
        video.play().then(() => video.pause()).catch(() => {})
        video.currentTime = 0

        const onCanPlay = () => { readyRef.current = true }
        const onSeeking = () => { seekingRef.current = true }
        const onSeeked = () => { seekingRef.current = false }
        video.addEventListener("canplaythrough", onCanPlay)
        video.addEventListener("seeking", onSeeking)
        video.addEventListener("seeked", onSeeked)

        // Pointer handler
        const handlePointer = (e: PointerEvent) => {
            let normX: number, normY: number
            if (trackingArea === "window") {
                normX = e.clientX / window.innerWidth
                normY = e.clientY / window.innerHeight
            } else {
                const rect = root.getBoundingClientRect()
                normX = (e.clientX - rect.left) / rect.width
                normY = (e.clientY - rect.top) / rect.height
            }
            let pos = axis === "horizontal"
                ? Math.max(0, Math.min(1, normX))
                : Math.max(0, Math.min(1, normY))
            if (reverse) pos = 1 - pos
            targetTimeRef.current = pos * (video.duration || 0)
        }

        const target = trackingArea === "window" ? window : root
        target.addEventListener("pointermove", handlePointer as EventListener)

        // RAF scrub loop
        const loop = () => {
            if (readyRef.current && isFinite(video.duration) && !seekingRef.current) {
                const next = currentTimeRef.current + (targetTimeRef.current - currentTimeRef.current) * smoothing
                if (Math.abs(video.currentTime - next) > 0.008) {
                    video.currentTime = next
                }
                currentTimeRef.current = next
            }
            rafRef.current = requestAnimationFrame(loop)
        }
        rafRef.current = requestAnimationFrame(loop)

        return () => {
            cancelAnimationFrame(rafRef.current)
            target.removeEventListener("pointermove", handlePointer as EventListener)
            video.removeEventListener("canplaythrough", onCanPlay)
            video.removeEventListener("seeking", onSeeking)
            video.removeEventListener("seeked", onSeeked)
        }
    }, [videoFile, axis, reverse, trackingArea, smoothing])

    if (!videoFile) {
        return (
            <div style={{
                width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#111", color: "rgba(255,255,255,0.4)",
                fontFamily: "system-ui", fontSize: 14,
                borderRadius,
            }}>
                Add a video file
            </div>
        )
    }

    return (
        <div ref={rootRef} style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius }}>
            <video
                ref={videoRef}
                src={videoFile}
                muted
                playsInline
                preload="auto"
                disableRemotePlayback
                style={{ width: "100%", height: "100%", objectFit, display: "block" }}
            />
        </div>
    )
}

addPropertyControls(CursorScrubVideo, {
    videoFile: {
        type: ControlType.File,
        allowedFileTypes: ["mp4", "webm", "mov"],
        title: "Video File",
    },
    axis: {
        type: ControlType.Enum,
        options: ["horizontal", "vertical"],
        optionTitles: ["Horizontal", "Vertical"],
        defaultValue: "horizontal",
        title: "Axis",
    },
    reverse: {
        type: ControlType.Boolean,
        defaultValue: false,
        title: "Reverse",
    },
    trackingArea: {
        type: ControlType.Enum,
        options: ["component", "window"],
        optionTitles: ["Component", "Window"],
        defaultValue: "component",
        title: "Tracking Area",
    },
    smoothing: {
        type: ControlType.Number,
        min: 0.02,
        max: 1,
        step: 0.01,
        defaultValue: 0.22,
        title: "Smoothing",
    },
    objectFit: {
        type: ControlType.Enum,
        options: ["cover", "contain", "fill"],
        optionTitles: ["Cover", "Contain", "Fill"],
        defaultValue: "cover",
        title: "Object Fit",
    },
    showPoster: {
        type: ControlType.Boolean,
        defaultValue: true,
        title: "Show Poster",
    },
    borderRadius: {
        type: ControlType.Number,
        min: 0,
        max: 999,
        defaultValue: 0,
        title: "Border Radius",
    },
})
