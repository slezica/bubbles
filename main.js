

class Bubbles {
  constructor(canvas) {
    this.canvas = canvas

    this.context = canvas.getContext('2d')
    this.context.globalCompositeOperation = 'lighter'

    this.bubbles = []
  }

  startingScale() {
    return 0.1
  }

  randomSize() {
    return 15 + Math.random() * 60
  }

  randomFill() {
    return `hsla(0, 0%, 100%, ${0.1 + Math.random() * 0.2})`
  }

  randomAngle() {
    return Math.random() * (Math.PI * 2)
  }

  randomSpeed() {
    return 1 + Math.random() * 3
  }

  randomX() {
    return Math.random() * this.canvas.width
  }

  randomY() {
    return Math.random() * this.canvas.height
  }

  addBubble() {
    this.addBubbleAt(this.randomX(), this.randomY())
  }

  addBubbleAt(x, y) {
    const bubble = {
      center: [x, y],
      size  : this.randomSize(),
      scale : this.startingScale(),
      fill  : this.randomFill(),
      angle : this.randomAngle(),
      speed : this.randomSpeed()
    }

    this.bubbles.push(bubble)
  }

  removeBubbleAt(x, y) {
    for (let i = 0; i < this.bubbles.length; i++) {
      let bubble = this.bubbles[i]

      let [ centerX, centerY ] = bubble.center
      let radius = bubble.size * bubble.scale

      if (
        x > centerX - radius &&
        x < centerX + radius &&
        y > centerY - radius &&
        y < centerY + radius
      ) {
        this.bubbles.splice(i, 1)
        return true
      }
    }

    return false
  }

  tick() {
    for (let bubble of this.bubbles) {
      let [ x, y ] = bubble.center

      if (bubble.scale < 1) {
        bubble.scale += 0.1
        return // don't move while growing
      }

      let radius = bubble.size * bubble.scale

      x += Math.cos(bubble.angle) * bubble.speed;
      y += Math.sin(bubble.angle) * bubble.speed;

      if (x > this.canvas.width + radius) {
        x = -radius;

      } else if (x < -radius) {
        x = this.canvas.width + radius;
      }

      if (y > this.canvas.height + radius) {
        y = -radius;

      } else if (y < -radius) {
        y = this.canvas.height + radius;
      }

      bubble.center = [ x, y ]
    }
  }

  render() {
    for (let bubble of this.bubbles) {
      let [ x, y ] = bubble.center
      let radius = bubble.size * bubble.scale

      this.context.beginPath()
      this.context.arc(x, y, radius, 0, Math.PI * 2)
      this.context.fillStyle = bubble.fill
      this.context.fill()
    }
  }
}


class Background {
  constructor(canvas) {
    this.canvas = canvas

    this.context = canvas.getContext('2d')
    this.context.globalCompositeOperation = "source-over"
    this.context.shadowColor = '#fff'
    this.context.shadowBlur = 4

    this.targetColor = [ 22, 120, 180 ]
    this.color = this.targetColor
    this.gradient = this.createGradient(this.color)
  }

  randomize() {
    this.targetColor = [
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256)
    ]
  }

  createGradient(color) {
    const { width, height } = this.canvas

    const start = color
    const end = color.map(value => Math.floor(value * 0.5))

    const gradient = this.context.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, `rgb(${start[0]}, ${start[1]}, ${start[2]})`)
    gradient.addColorStop(1, `rgb(${end[0]}, ${end[1]}, ${end[2]})`)

    return gradient
  }

  tick() {
    for (let i = 0; i < 3; i++) {
      let distance = this.targetColor[i] - this.color[i]

      if (distance > 10) {
        this.color[i] += 10

      } else if (distance < -10) {
        this.color[i] -= 10

      } else {
        this.color[i] = this.targetColor[i]
      }
    }

    this.gradient = this.createGradient(this.color)
  }

  render() {
    this.context.fillStyle = this.gradient
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }
}


function start() {
  const canvas = document.querySelector('canvas')
  canvas.width = document.body.clientWidth
  canvas.height = document.body.clientHeight

  const bubbles = new Bubbles(canvas)
  const background = new Background(canvas)

  canvas.addEventListener('click', function(e) {
    if (! bubbles.removeBubbleAt(e.clientX, e.clientY)) {
      bubbles.addBubbleAt(e.clientX, e.clientY)
    }
  })

  canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault()
    background.randomize()
  })

  function renderFrame() {
    background.tick()
    bubbles.tick()

    background.render()
    bubbles.render()

    requestAnimationFrame(renderFrame)
  }

  requestAnimationFrame(renderFrame)
}


start()
