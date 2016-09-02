let layers = {}
let objects
let map

window.onload = function() {
    let game = new Phaser.Game("100%", "100%", Phaser.CANVAS, "game", {
        preload: function() {
            // Plugins
            //this.game.add.plugin(Phaser.Plugin.Debug)
            this.game.add.plugin(Phaser.Plugin.Tiled)

            let preload = this
            let cacheKey = Phaser.Plugin.Tiled.utils.cacheKey

            // Map
            this.game.load.tiledmap(cacheKey("overworld", "tiledmap"), "assets/maps/city.json", null, Phaser.Tilemap.TILED_JSON)
            this.game.load.image(cacheKey("overworld", "tileset", "rpg"), "assets/sheets/rpg.png")

            /*
            // Map
            this.load.tilemap("world", "assets/maps/city.json", null, Phaser.Tilemap.TILED_JSON)
            this.load.image("spritesheet", "assets/sheets/rpg.png")
            */

            // Assets
            this.load.image("player", "assets/player.png")

            // Objects
            let objc = [
                "shadow",
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
                preload.load.image(sprite, "assets/sprites/" + sprite + ".png")
            })

            // Debug
            this.game.time.advancedTiming = true
        },

        create: function() {
            // Physics
            this.game.physics.startSystem(Phaser.Physics.P2JS)
            this.game.physics.p2.restitution = 0

            // Map
            map = this.map = this.game.add.tiledmap("overworld")

            // Collision
            this.game.physics.p2.convertTiledCollisionObjects(map, "collision")

            // Player
            let result = this.findObjects(this.map, "objects", "spawnPoint")
            this.player = this.game.add.sprite(result[0].x, result[0].y, "player")
            this.game.physics.p2.enable(this.player)
            this.game.camera.follow(this.player)

            objects = this.game.add.group()
            objects.enableBody = true

            // Objects
            this.spawnObjects("objects")

            // Movement
            this.cursors = this.game.input.keyboard.createCursorKeys()
        },

        update: function() {
            // Movement
            let speed = 250

            this.player.body.collideWorldBounds = true
            this.player.body.fixedRotation = true
            this.player.body.velocity.x = 0
            this.player.body.velocity.y = 0

            // Modifier
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)) {
                speed = 400
            }

            // Vertical
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.W) || this.cursors.up.isDown) {
                this.player.body.velocity.y -= speed
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.S) || this.cursors.down.isDown) {
                this.player.body.velocity.y += speed
            }

            // Horizontal
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.A) || this.cursors.left.isDown) {
                this.player.body.velocity.x -= speed
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.D) || this.cursors.right.isDown) {
                this.player.body.velocity.x += speed
            }
        },

        render: function() {
            // Player Bounds
            this.game.debug.body(this.player)
            this.game.debug.body(objects)

            // FPS
            this.game.debug.text(game.time.fps, 2, 15, "#FFFF00")
        },

        collect: function(player, item) {
            item.destroy()
        },

        /*
         * Helper
         * Functions
         */

        // Spawn Items
        spawnObjects: function(layer) {
            let item
            let result = this.findObjects(map, layer)

            result.forEach(function(element) {
                this.createObject(element, objects)
            }, this)
        },

        // Find Objects in a Layer containing property: type, equal to the given value
        findObjects: function(map, layer, type) {
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
        },

        // Create Sprite from Object
        createObject: function(element, group) {
            if (element.properties) {
                if (element.properties.sprite) {
                    let sprite = group.create(element.x, element.y, element.properties.sprite)

                    Object.keys(element.properties).forEach(function(key) {
                        sprite[key] = element.properties[key]
                    })
                }
            }
        }
    })
}
