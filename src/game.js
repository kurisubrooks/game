let config = {
    debug: false,
    player: {
        speed: 250,
        stamina: 100
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
        console.log(map)

        // Collision
        game.physics.p2.convertTiledCollisionObjects(map, "collision")

        // Player
        let result = findObjects(map, "objects", "spawnPoint")
        player = game.add.sprite(result[0].x, result[0].y, "player")
        game.physics.p2.enable(player)
        game.camera.follow(player)

        // Objects
        objects = game.add.group()
        objects.enableBody = true
        objects.sort()

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
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
            player.body.velocity.y += config.player.speed
        }

        // Horizontal
        if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
            player.body.velocity.x -= config.player.speed
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            player.body.velocity.x += config.player.speed
        }

        // Stamina + Running
        let keyboard = game.input.keyboard
        let key = Phaser.Keyboard

        if (keyboard.isDown(key.W) || keyboard.isDown(key.A) || keyboard.isDown(key.S) || keyboard.isDown(key.D)) {
            if (keyboard.isDown(key.SHIFT)) {
                if (config.player.stamina > 0) {
                    console.log("running")
                    config.player.speed = 400
                    config.player.stamina -= 0.5
                } else {
                    console.log("exhausted")
                    config.player.speed = 250
                }
            } else {
                console.log("walking")
                config.player.speed = 250

                if (config.player.stamina !== 100) {
                    config.player.stamina += 0.1
                }
            }
        }
    }

    function render() {
        // Player Bounds
        game.debug.body(player)
        game.debug.body(objects)

        // FPS
        game.debug.text("FPS: " + game.time.fps, 2, 15, "#FFFF00")
        game.debug.text("Speed: " + config.player.speed, 2, 35, "#FFFF00")
        game.debug.text("Stamina: " + config.player.stamina, 2, 55, "#FFFF00")
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
