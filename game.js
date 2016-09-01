let objects
let map

window.onload = function() {
    let game = new Phaser.Game(720, 480, Phaser.AUTO, "game", {
        preload: function() {
            // Map
            this.load.tilemap("world", "assets/maps/city.json", null, Phaser.Tilemap.TILED_JSON)
            this.load.image("spritesheet", "assets/sheets/rpg.png")

            // Images
            let player = this.load.image("player", "assets/player.png")

            this.game.time.advancedTiming = true
        },
        create: function() {
            // Create Physics
            this.game.physics.startSystem(Phaser.Physics.ARCADE)

            // Load Map and Tileset
            this.map = this.game.add.tilemap("world")
            this.map.addTilesetImage("rpg", "spritesheet")
            map = this.map

            // Add Map Layers
            this.backgroundlayer = this.map.createLayer("background")
            this.underBlockedLayer = this.map.createLayer("underPhysical")
            this.blockedLayer = this.map.createLayer("physical")

            // Collission Layer
            this.map.setCollisionBetween(1, 2000, true, "underPhysical")
            this.map.setCollisionBetween(1, 2000, true, "physical")

            // Resize Game World to match Map
            this.backgroundlayer.resizeWorld()

            // Spawn Overworld Objects
            let objects = this.game.add.group()
            //objects.enableBody = true

            this.map.objects.objects.forEach(function(element) {
                map.createFromObjects(element.name, element.gid, element.properties.sprite, 0, true, false, objects)
            })

            // Create Player
            let result = this.findObjectsByType(this.map, "objects", "spawnPoint")
            this.player = this.game.add.sprite(result[0].x, result[0].y, "player")
            this.game.physics.arcade.enable(this.player)

            // Camera Follows Player
            this.game.camera.follow(this.player)

            // Move Player (with arrow keys)
            this.cursors = this.game.input.keyboard.createCursorKeys()
        },
        update: function() {
            let speed = 100

            this.player.body.collideWorldBounds = true
            this.player.body.velocity.x = 0
            this.player.body.velocity.y = 0

            if (this.cursors.up.isDown) {
                this.player.body.velocity.y -= speed
            } else if (this.cursors.down.isDown) {
                this.player.body.velocity.y += speed
            }

            if (this.cursors.left.isDown) {
                this.player.body.velocity.x -= speed
            } else if (this.cursors.right.isDown) {
                this.player.body.velocity.x += speed
            }

            // Collision Map
            this.game.physics.arcade.collide(this.player, this.blockedLayer)
            this.game.physics.arcade.collide(this.player, this.underBlockedLayer)
            this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this)
        },

        render: function() {
            //this.game.debug.body(this.player)
            this.game.debug.text(game.time.fps, 2, 15, "#FFFF00")
        },

        collect: function(player, collectable) {
            console.log("Player collected Collectable")

            // Destroy Sprite
            collectable.destroy()
        },

        /*spawnObjects: function(map, type) {
            let layer = "objects"

            this.load.image("sign", "assets/sprites/sign.png")
        },

        findObject: function(map, layer, type) {
            let result = []

            map.objects[layer].forEach(function(element) {
                if (element.properties.type === type) {
                    element.y -= map.tileHeight
                    result.push(element)
                }
            })

            return result
        },*/

        // Spawn Items
        /*createItems: function() {
            this.items = this.game.add.group()
            this.items.enableBody = true

            let item
            let result = this.findObjectsByType(this.map, "objects", "item")
            let results = []

            result.forEach(function(element) {
                this.createFromTiledObject(element, this.items)
            }, this)
        },*/

        // Find Objects in a Layer containing property: type, equal to the given value
        findObjectsByType: function(map, layer, type) {
            let result = []

            map.objects[layer].forEach(function(element) {
                if (element.properties) {
                    if (type) {
                        if (element.properties.type === type) {
                            element.y -= map.tileHeight
                            result.push(element)
                        }
                    }
                }
            })

            return result
        },

        // Create Sprite from Object
        createFromTiledObject: function(element, group) {
            let sprite = group.create(element.x, element.y, element.properties.sprite)

            if (element.properties) {
                Object.keys(element.properties).forEach(function(key) {
                    sprite[key] = element.properties[key]
                })
            }
        },

        // Generate Random ID
        generateID: function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
            }

            return s4() + s4() + "-" + s4() + "-" + s4() + "-" +s4() + "-" + s4() + s4() + s4()
        }
    })
}
