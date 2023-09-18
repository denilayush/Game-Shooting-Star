
const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')


canvas.width = innerWidth
canvas.height = innerHeight
//console.log(c)

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const scoreBoardEl = document.querySelector('#scoreBoardEl')
const finalScoreEl = document.querySelector('#finalScoreEl')
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw() {
        // The beginPath() method begins a path, or resets the current path.
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

//projectile 
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        // The beginPath() method begins a path, or resets the current path.
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        // The beginPath() method begins a path, or resets the current path.
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}
// particles that appears after collision of enemy and projectile
const friction = 0.99
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        // The beginPath() method begins a path, or resets the current path.
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
    update() {

        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height / 2



let player = new Player(x, y, 10, 'White')
player.draw()
//console.log(player)

// const projectile = new Projectile(
//     canvas.width/2,
//     canvas.height/2,
//     5,
//     'red',
//     {
//         x:1,
//         y:1
//     })

// const projectile2 = new Projectile(
//     canvas.width/2,
//     canvas.height/2,
//     5,
//     'green',
//     {
//         x:-1,
//         y:-1
//     })

// const projectiles = [projectile, projectile2 ]


let projectiles = []
let enemies = []
let particles = []

function init() {
    player = new Player(x, y, 10, 'White')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreEl.innerHTML = score
    finalScoreEl.innerHTML = score
}

function spawnEnemies() {
    setInterval(() => {

        const radius = Math.random() * (30 - 4) + 4
        let x
        let y
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
            //  y = Math.random()< 0.5 ? 0 - radius : canvas.height + radius 
        }
        else {
            x = Math.random() * canvas.width

            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius

        }
        const color = `hsl(${Math.random() * 360},50%,50%)`
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        //console.log(angle)

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }


        enemies.push(new Enemy(x, y, radius, color, velocity))
        // console.log(enemies)
    }, 800);
}

let animationId
let score = 0
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        }
        else {
            particle.update()
        }
    })

    projectiles.forEach((projectile, index) => {
        projectile.update()

        // removing projectile outside of canvas
        if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {

                projectiles.splice(index, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, index) => {
        enemy.update()
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        //end game
        if (dist - enemy.radius - player.radius < 1) {
            // console.log('end game')
            cancelAnimationFrame(animationId)
            scoreBoardEl.style.display = 'flex'
            // gsap=fromTo('#scoreBoardEl',{scale:0.8,opacity:0},{
            //     scale:1,opacity:1,
            //     ease:'expo'
            // })

            finalScoreEl.innerHTML = score
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            //console.log(dist)


            // When projectile touch enemy
            if (dist - enemy.radius - projectile.radius < 1) {


                // create explosions
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color,
                        { x: (Math.random() - 0.5) * (Math.random() * 8), y: (Math.random() - 0.5) * (Math.random() * 8) }))

                }

                if (enemy.radius - 10 > 5) {

                    //increase our score

                    score += 100
                    scoreEl.innerHTML = score


                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
                else {
                    // when we remove from screen
                    //increase our score

                    score += 250
                    scoreEl.innerHTML = score
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }

                // enemies.splice(index, 1)
                // projectiles.splice(projectileIndex, 1)
            }
        })
    })

}

window.addEventListener('click', (event) => {
    // console.log(projectiles)
    // console.log(event.clientX)
    // console.log(event.clientY)
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
    // console.log(angle)

    const velocity = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    }

    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white',
        velocity))


})

startGameBtn.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()

    scoreBoardEl.style.display = 'none'

    // gsap.to('#scoreBoardEl', {
    //     opacity:0,
    //     scale:0.8,
    //     duration:0.3,
    //     ease: 'expo.in',
    //     onComplete: ()=>{
    //         scoreBoardEl.style.display = 'none'
    //     }
    // })
})
