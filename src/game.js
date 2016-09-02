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
        //game.add.plugin(Phaser.Plugin.Debug)
        game.add.plugin(Phaser.Plugin.Tiled)

        let cacheKey = Phaser.Plugin.Tiled.utils.cacheKey

        // Map
        game.load.tiledmap(cacheKey("overworld", "tiledmap"), "src/assets/maps/city.json", null, Phaser.Tilemap.TILED_JSON)
        game.load.image(cacheKey("overworld", "tileset", "rpg"), "src/assets/sheets/rpg.png")

        // Assets
        game.load.image("player", "src/assets/player.png")

        // Objects
        let objects = [
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
        ].forEach(function(sprite) {
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
        let speed = 250

        player.body.collideWorldBounds = true
        player.body.fixedRotation = true
        player.body.velocity.x = 0
        player.body.velocity.y = 0

        // Modifier
        if (game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)) {
            speed = 400
        }

        // Vertical
        if (game.input.keyboard.isDown(Phaser.Keyboard.W) || cursors.up.isDown) {
            player.body.velocity.y -= speed
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.S) || cursors.down.isDown) {
            player.body.velocity.y += speed
        }

        // Horizontal
        if (game.input.keyboard.isDown(Phaser.Keyboard.A) || cursors.left.isDown) {
            player.body.velocity.x -= speed
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.D) || cursors.right.isDown) {
            player.body.velocity.x += speed
        }

        if (game.input.keyboard.isDown(Phaser.Keyboard.ESC)) {
            player.kill()
        }
    }

    function render() {
        // Player Bounds
        game.debug.body(player)
        game.debug.body(objects)

        // FPS
        game.debug.text(game.time.fps, 2, 15, "#FFFF00")
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
