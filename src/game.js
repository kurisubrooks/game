let config = {
    debug: false,
    player: {
        name: "Ghost",
        moving: false,
        facing: "S",
        state: "still",
        speed: 250,
        health: 100,
        mana: 500,
        stamina: 100,
        maxHealth: 100,
        maxMana: 500,
        maxStamina: 100
    },
    types: [
        "spawnPoint",
        "barrier",
        "decoration",
        "door",
        "shrub",
        "storage"
    ],
    objects: [
        "bush",
        "weed",
        "barrel",
        "barrelWood",
        "basket",
        "crate",
        "crateLarge",
        "door",
        "window",
        "fence",
        "fenceLeft",
        "fenceRight",
        "treeBase",
        "treeBase2",
        "treeBaseSmall",
        "treeTop",
        "treeTop2",
        "treeTopSmall"
    ]
}

let objects
let cursors
let player
let nameplate
let map

window.onload = function() {
    let game = new Phaser.Game("100%", "100%", Phaser.CANVAS, "game", {
        preload: preload,
        create: create,
        update: update,
        render: render
    })

    function preload() {
        // Plugins
        if (config.debug) game.add.plugin(Phaser.Plugin.Debug)
        game.add.plugin(Phaser.Plugin.Tiled)

        let cacheKey = Phaser.Plugin.Tiled.utils.cacheKey

        // Map
        game.load.tiledmap(cacheKey("overworld", "tiledmap"), "src/assets/maps/city.json", null, Phaser.Tilemap.TILED_JSON)
        game.load.image(cacheKey("overworld", "tileset", "rpg"), "src/assets/sheets/rpg.png")

        // Assets
        game.load.image("player", "src/assets/player.png")

        // Objects
        config.objects.forEach(function(sprite) {
            game.load.image(sprite, "src/assets/sprites/" + sprite + ".png")
        })

        // Debug
        game.time.advancedTiming = true
    }

    function create() {
        // Physics
        game.physics.startSystem(Phaser.Physics.P2JS)

        // Map
        map = game.add.tiledmap("overworld")

        // Collision
        game.physics.p2.convertTiledCollisionObjects(map, "collision")

        // Player
        let result = findObjects(map, "objects", "spawnPoint")
        player = game.add.sprite(result[0].x, result[0].y, "player")
        game.physics.p2.enable(player)
        game.camera.follow(player)

        nameplate = game.add.text(0, 0, config.player.name, {
            font: "16px kenpixel",
            fill: "#FFFFFF",
            align: "center"
        })
        nameplate.anchor.set(0.5)

        // Objects
        objects = game.add.group()
        objects.enableBody = true
        spawnObjects("objects")

        // Movement
        cursors = game.input.keyboard.createCursorKeys()
    }

    function update() {
        // Movement
        player.body.collideWorldBounds = true
        player.body.fixedRotation = true
        player.body.velocity.x = 0
        player.body.velocity.y = 0

        // Vertical
        if (game.input.keyboard.isDown(Phaser.Keyboard.W)) {
            player.body.velocity.y -= config.player.speed
            config.player.facing = "N"
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
            player.body.velocity.y += config.player.speed
            config.player.facing = "S"
        }

        // Horizontal
        if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
            player.body.velocity.x -= config.player.speed
            config.player.facing = "W"
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            player.body.velocity.x += config.player.speed
            config.player.facing = "E"
        }

        // Stamina + Running
        let keyboard = game.input.keyboard
        let key = Phaser.Keyboard

        if (keyboard.isDown(key.W) || keyboard.isDown(key.A) || keyboard.isDown(key.S) || keyboard.isDown(key.D)) {
            config.player.moving = true

            if (keyboard.isDown(key.SHIFT)) {
                if (config.player.stamina > 0) {
                    config.player.state = "running"
                    config.player.speed = 400
                    config.player.stamina -= 0.5
                } else {
                    config.player.state = "exhausted"
                    config.player.speed = 150
                }
            } else {
                config.player.state = "walking"
                config.player.speed = 250

                if (config.player.stamina <= config.player.maxStamina) {
                    config.player.stamina += 0.1
                }
            }
        } else {
            config.player.moving = false
            config.player.state = "still"
        }

        if (!config.player.moving) {
            if (config.player.stamina <= config.player.maxStamina) {
                config.player.stamina += 0.5
            }
        }

        if (config.player.stamina > config.player.maxStamina) config.player.stamina = config.player.maxStamina
        if (config.player.stamina < 0) config.player.stamina = 0

        // Nameplate
        nameplate.x = player.x
        nameplate.y = player.y - player.height
    }

    function render() {
        // Player Bounds
        game.debug.body(player)
        game.debug.body(objects)

        // FPS
        game.debug.text("FPS: " + game.time.fps, 2, 15, "#FFFF00")
        game.debug.text("Speed: " + config.player.speed, 2, 35, "#FFFF00")
        game.debug.text("Health: " + config.player.health, 2, 55, "#FF4444")
        game.debug.text("Stamina: " + Math.round(config.player.stamina * 10) / 10, 2, 75, "#44FF44")
        game.debug.text("Mana: " + config.player.mana, 2, 95, "#0000FF")
        game.debug.text("State: " + config.player.state, 2, 115, "#FFFF00")
        game.debug.text("Direction: " + config.player.facing, 2, 135, "#FFFF00")
    }

    function spawnObjects(layer) {
        let item
        let result = findObjects(map, layer)

        result.forEach(function(element) {
            if (element.properties) {
                if (element.properties.sprite) {
                    let sprite = objects.create(element.x, element.y, element.properties.sprite)

                    Object.keys(element.properties).forEach(function(key) {
                        sprite[key] = element.properties[key]
                    })
                }
            }
        })
    }

    function findObjects(map, layer, type) {
        let result = []

        map.objects.forEach(function(title) {
            if (title.name === layer) {
                title.objects.forEach(function(element) {
                    if (type) {
                        if (element.properties) {
                            if (element.properties.type === type) {
                                element.y -= map.tileHeight
                                result.push(element)
                            }
                        }
                    } else {
                        element.y -= map.tileHeight
                        result.push(element)
                    }
                })
            }
        })

        return result
    }
}
