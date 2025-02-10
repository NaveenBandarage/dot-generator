"use client"

import { useRef, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

export default function DotMatrixGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dotSpacing, setDotSpacing] = useState(8)
  const [dotSize, setDotSize] = useState(2)
  const [imageUrl, setImageUrl] = useState(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-zzaCSjW0h4ULfzFkW9woHqqoApX6YC.png",
  )

  const generateDotMatrix = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
    // Clear canvas
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Create temporary canvas for processing
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    // Set dimensions
    tempCanvas.width = img.width
    tempCanvas.height = img.height

    // Draw and process image
    tempCtx.drawImage(img, 0, 0)
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
    const data = imageData.data

    // Draw dots
    ctx.fillStyle = "white"
    for (let y = 0; y < img.height; y += dotSpacing) {
      for (let x = 0; x < img.width; x += dotSpacing) {
        const i = (y * img.width + x) * 4
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3

        // Only draw dot if pixel is bright enough
        if (brightness > 128) {
          ctx.beginPath()
          ctx.arc(x, y, dotSize, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }

  const processImage = (url: string) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height
      generateDotMatrix(ctx, img)
    }
    img.src = url
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImageUrl(url)
    }
  }

  useEffect(() => {
    processImage(imageUrl)
  }, [imageUrl, dotSpacing, dotSize])

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Dot Matrix Generator</CardTitle>
        <CardDescription className="text-muted-foreground">
          Convert images into dot matrix patterns that are downloadable. Inspired by Sam Dape and OpenAI&apos;s
          Superbowl Ad.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Upload Image</Label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
        </div>

        <div className="space-y-2">
          <Label>Dot Spacing ({dotSpacing}px)</Label>
          <Slider value={[dotSpacing]} onValueChange={(value) => setDotSpacing(value[0])} min={4} max={20} step={1} />
        </div>

        <div className="space-y-2">
          <Label>Dot Size ({dotSize}px)</Label>
          <Slider value={[dotSize]} onValueChange={(value) => setDotSize(value[0])} min={1} max={5} step={0.5} />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <canvas ref={canvasRef} className="max-w-full h-auto bg-black" />
        </div>

        <Button
          onClick={() => {
            const canvas = canvasRef.current
            if (canvas) {
              const link = document.createElement("a")
              link.download = "dot-matrix.png"
              link.href = canvas.toDataURL()
              link.click()
            }
          }}
        >
          Download Image
        </Button>
      </CardContent>
    </Card>
  )
}

