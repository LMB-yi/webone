/**
 * 图形验证码生成工具
 * 生成带干扰线和干扰点的图形验证码
 */

export function generateCaptcha(length = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function drawCaptcha(canvas, code) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  // 背景
  ctx.fillStyle = '#f0f2f5'
  ctx.fillRect(0, 0, width, height)

  // 干扰线
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgb(${Math.random() * 200 + 50}, ${Math.random() * 200 + 50}, ${Math.random() * 200 + 50})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(Math.random() * width, Math.random() * height)
    ctx.lineTo(Math.random() * width, Math.random() * height)
    ctx.stroke()
  }

  // 干扰点
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgb(${Math.random() * 200 + 50}, ${Math.random() * 200 + 50}, ${Math.random() * 200 + 50})`
    ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2)
  }

  // 验证码文字
  const fontSize = 28
  ctx.font = `bold ${fontSize}px Arial`
  ctx.textBaseline = 'middle'

  const charWidth = width / (code.length + 1)
  for (let i = 0; i < code.length; i++) {
    const x = charWidth * (i + 0.5)
    const y = height / 2 + (Math.random() * 8 - 4)
    const angle = (Math.random() - 0.5) * 0.6

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.fillStyle = `rgb(${Math.random() * 100 + 20}, ${Math.random() * 100 + 20}, ${Math.random() * 100 + 20})`
    ctx.fillText(code[i], -fontSize / 3, 0)
    ctx.restore()
  }
}
