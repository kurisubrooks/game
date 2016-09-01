let layers = {}
let objects
let map

window.onload = function() {
    let game = new Phaser.Game("100%", "100%", Phaser.CANVAS, "game", {
        preload: function() {
            let preload = this

            // Map
            this.load.tilemap("world", "assets/maps/city.json", null, Phaser.Tilemap.TILED_JSON)
            this.load.image("spritesheet", "assets/sheets/rpg.png")
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
            this.game.physics.startSystem(Phaser.Physics.ARCADE)

            // Map
            this.map = this.game.add.tilemap("world")
            this.map.addTilesetImage("rpg", "spritesheet")
            map = this.map

            // Tiles
            layers.base = this.map.createLayer("base")
            layers.buildings = this.map.createLayer("buildings")
            layers.roof = this.map.createLayer("roof")

            // Objects
            layers.shadows = this.map.createLayer("shadows")
            layers.objects = this.map.createLayer("objects")
            layers.collision = this.map.createLayer("collision")

            //this.map.setCollisionBetween(1, 2000, true, "collision")
            layers.base.resizeWorld()

            objects = this.game.add.group()
            objects.enableBody = true

            this.spawnObjects("objects")
            this.spawnObjects("collision")

            // Player
            let result = this.findObjects(this.map, "objects", "spawnPoint")
            this.player = this.game.add.sprite(result[0].x, result[0].y, "player")
            this.game.physics.arcade.enable(this.player)
            this.game.camera.follow(this.player)

            // Movement
            this.cursors = this.game.input.keyboard.createCursorKeys()
        },

        update: function() {
            // Movement
            let speed = 250

            this.player.body.collideWorldBounds = true
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

            // Collision
            this.game.physics.arcade.collide(this.player, this.blockedLayer)
            this.game.physics.arcade.collide(this.player, this.underBlockedLayer)
        },

        render: function() {
            // Player Bounds
            //this.game.debug.body(this.player)

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
            let result = this.findObjects(this.map, layer)

            result.forEach(function(element) {
                this.createObject(element, objects)
            }, this)
        },

        // Find Objects in a Layer containing property: type, equal to the given value
        findObjects: function(map, layer, type) {
            let result = []

            map.objects[layer].forEach(function(element) {
                if (element.properties) {
                    if (type) {
                        if (element.properties.type === type) {
                            element.y -= map.tileHeight
                            result.push(element)
                        }
                    } else {
                        element.y -= map.tileHeight
                        result.push(element)
                    }
                }
            })

            console.log(result)
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
