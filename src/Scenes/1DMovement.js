class playerAvatar extends Phaser.Scene {
    constructor() {
        super("1DMovement");
        this.my = {sprite: {}, text: {}};
        this.my.sprite.bullet = [];
        this.my.sprite.yellowDucks = [];
        this.my.sprite.brownDucks = [];
        this.my.sprite.whiteDucks = [];
        this.maxBullets = 10;
        this.myScore = 0;
        this.myHealth = 100;
        this.ducksFed = 0;
        this.waveStart = false;
        //checks if each wave has been completed
        this.wave1 = false;
        this.wave2 = false;
        this.wave3 = false;
        this.title = false; //only show title once
        this.start = false; //track whether the game is running
        this.gameOver = false; //if game has ended
        this.textDisplay = true; //checks if theres already text being displayed
        this.gameWon = false; //player won?
    }
    preload(){
        this.load.setPath("./assets/");
        this.load.image("pond_tiles", "roguelikeSheet_transparent.png");    // tile sheet   
        this.load.tilemapTiledJSON("map", "duckPond.json");                   // Load JSON of tilemap
        //player/food/duck sprites
        this.load.image("player", "playerGrey_up3.png");
        this.load.image("bullet1", "yellowCrystal.png");
        this.load.image("bullet2", "redCrystal.png");
        this.load.image("bullet3", "blueCrystal.png");
        this.load.image("bullet4", "greenCrystal.png");
        this.load.image("yellowDuck", "duck_yellow.png");
        this.load.image("brownDuck", "duck_brown.png");
        this.load.image("whiteDuck", "duck_white.png");
        this.load.image("poop", "pole.png");
        //smoke effects
        this.load.image("puff0", "smokeWhite3.png");
        this.load.image("puff1", "smokeWhite4.png");
        this.load.image("puff2", "smokeWhite5.png");
        this.load.image("greyPuff0", "smokeGrey4.png");
        this.load.image("greyPuff1", "smokeGrey5.png");
        this.load.image("greyPuff2", "smokeGrey0.png");
        //font
        this.load.bitmapFont("miniSquare", "kenney_mini_square_0.png", "kenney_mini_square.fnt");
        //audio
        this.load.audio("pop", "select_006.ogg");
        this.load.audio("drop", "drop_004.ogg");
    }
    create(){
        document.getElementById('description').innerHTML = '<h2>feedTheDucks.js<br>Press any of the following keys to start! A: move left, D: move right, Space: throw food, P: pause/unpause, R: play again</h2>'
        //tile map
        this.map = this.add.tilemap("map", 16, 16, 20, 25);
        this.tileset = this.map.addTilesetImage("duck_pond", "pond_tiles");
        this.grassLayer = this.map.createLayer("Grass-n-water", this.tileset, 0, 0);
        this.flowerLayer = this.map.createLayer("Flowers", this.tileset, 0, 0);
        this.grassLayer.setScale(1.75);
        this.flowerLayer.setScale(1.75);
        //player sprite
        let my = this.my;
        my.sprite.player = this.add.sprite(290, 610, "player");
        my.sprite.wave1 = this.add.sprite(10, 115, "yellowDuck").setScale(0.4);
        my.sprite.wave2 = this.add.sprite(10, 80, "brownDuck").setScale(0.4);
        my.sprite.wave3 = this.add.sprite(10, -305, "whiteDuck").setScale(0.4);
        my.sprite.wave1.visible = false;
        my.sprite.wave2.visible = false;
        my.sprite.wave3.visible = false;
        //create smoke animation
        //white smoke - enemy dying
        this.anims.create({
            key: "puff",
            frames: [
                { key: "puff2" },
                { key: "puff1" },
                { key: "puff0" }
            ],
            frameRate: 25,    // Note: case sensitive (thank you Ivy!)
            hideOnComplete: true
        });
        //grey smoke - player hit
        this.anims.create({
            key: "greyPuff",
            frames: [
                { key: "greyPuff2" },
                { key: "greyPuff1" },
                { key: "greyPuff0" }
            ],
            frameRate: 25,    // Note: case sensitive (thank you Ivy!)
            hideOnComplete: true
        });
        //keys
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.SpaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.PKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.RKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        //object speed
        this.playerSpeed = 9;
        this.bulletSpeed = 40;
        this.poopSpeed = 15;
        this.duckSpeed = 1.5;
        //text
        //score and health text
        my.text.score = this.add.bitmapText(15, 660, "miniSquare", "Score " + this.myScore);
        my.text.health = this.add.bitmapText(15, 630, "miniSquare", "Health " + this.myHealth);
        //top title text
        this.add.text(190, 5, "Feed the Ducks!", {
            fontFamily: 'Lucida, monospace',
            fontSize: 24,
        });

        //title text
        this.titleText1 = this.add.text(
            70, 260, "Feed the Ducks!", {
            fontFamily: 'Lucida, monospace',
            fontSize: 52,
        }).setVisible(false);
        this.titleText2 = this.add.text(
            35, 320, "Feed as many ducks as you can.", {
            fontFamily: 'Lucida, monospace',
            fontSize: 32,
        }).setVisible(false);
        this.titleText3 = this.add.text(
            75, 360, "Don't get bitten or hit \n    by their poop!", {
            fontFamily: 'Lucida, monospace',
            fontSize: 32,
        }).setVisible(false);
        this.titleText4 = this.add.text(
            100, 450, "Press Space to start.", {
            fontFamily: 'Lucida, monospace',
            fontSize: 32,
        }).setVisible(false);

        //pause text
        this.pauseGameText1 = this.add.text(
            180, 260, "Paused!", {
            fontFamily: 'Lucida, monospace',
            fontSize: 52,
        }).setVisible(false);
        this.pauseGameText2 = this.add.text(
            100, 320, "Press P to unpause!", {
            fontFamily: 'Lucida, monospace',
            fontSize: 32,
        }).setVisible(false);

        //lose game text
        this.loseGameText1 = this.add.text(120, 290, "Game Over!", {
            fontFamily: 'Lucida, monospace',
            fontSize: 64,
        }).setVisible(false);
        this.loseGameText2 = this.add.text(130, 350, "You fed " + this.ducksFed + " ducks!", {
            fontFamily: 'Lucida, monospace',
            fontSize: 32,
        }).setVisible(false);
        this.loseGameText3 = this.add.text(90, 400, "Press R to play again.", {
            fontFamily: 'Lucida, monospace',
            fontSize: 32,
        }).setVisible(false);

        //win game text
        this.winGameText1 = this.add.text(120, 290, "Good Job!", {
            fontFamily: 'Lucida, monospace',
            fontSize: 64,
        }).setVisible(false);
        this.winGameText2 = this.add.text(130, 350, "You fed " + this.ducksFed + " ducks!", {
            fontFamily: 'Lucida, monospace',
            fontSize: 32,
        }).setVisible(false);
        this.winGameText3 = this.add.text(90, 400, "Press R to play again.", {
            fontFamily: 'Lucida, monospace',
            fontSize: 32,
        }).setVisible(false);

        //wave text (shown on top left)
        this.wave1Text = this.add.text(10, 5, "Wave 1/3", {
            fontFamily: 'Lucida, monospace',
            fontSize: 24,
        }).setVisible(false);
        this.wave2Text = this.add.text(10, 5, "Wave 2/3", {
            fontFamily: 'Lucida, monospace',
            fontSize: 24,
        }).setVisible(false);
        this.wave3Text = this.add.text(10, 5, "Wave 3/3", {
            fontFamily: 'Lucida, monospace',
            fontSize: 24,
        }).setVisible(false);
    }
    update(){
        let my = this.my;
        //reset game
        if (this.gameOver == true && Phaser.Input.Keyboard.JustDown(this.RKey)) {
            this.gameOver = false;
            this.myScore = 0;
            this.updateScore();
            this.myHealth = 100;
            this.updateHealth();
            this.ducksFed = 0;
            this.waveStart = false;
            this.wave1 = false;
            this.wave2 = false;
            this.wave3 = false;
            this.title = false;
            this.start = false;
            this.clearDucks(my.sprite.yellowDucks);
            this.clearDucks(my.sprite.brownDucks);
            this.clearDucks(my.sprite.whiteDucks);
            this.loseGameText1.visible = false;
            this.loseGameText2.visible = false;
            this.loseGameText3.visible = false;
            if(this.gameWon == true){
                this.winGameText1.visible = false;
                this.winGameText2.visible = false;
                this.winGameText3.visible = false;
            }
            my.sprite.player.x = 290;
            my.sprite.wave1.y = 115;
            my.sprite.wave2.y = 80;
            my.sprite.wave3.y = -305;
            this.wave2Text.visible = false;
            this.wave3Text.visible = false;
        }
        //if game is over, freeze everything
        if(this.gameOver == false){
            //move left
            if (this.left.isDown) {
                // Check to make sure the sprite can actually move left
                if (my.sprite.player.x > (my.sprite.player.displayWidth/2)) {
                    my.sprite.player.x -= this.playerSpeed;
                }
                this.start = true;
            }
            //move right
            if (this.right.isDown) {
                // Check to make sure the sprite can actually move right
                if (my.sprite.player.x < (game.config.width - (my.sprite.player.displayWidth/2))) {
                    my.sprite.player.x += this.playerSpeed;
                }
                this.start = true;
            }
            //press space to shoot
            if (Phaser.Input.Keyboard.JustDown(this.SpaceKey)) {
                if(my.sprite.bullet.length < this.maxBullets){
                    let randomBullet = Math.random();
                    if(randomBullet < 0.25){
                        my.sprite.food = this.add.sprite(my.sprite.player.x, my.sprite.player.y-(my.sprite.player.displayHeight/2), "bullet1");
                    }
                    else if(randomBullet < 0.5){
                        my.sprite.food = this.add.sprite(my.sprite.player.x, my.sprite.player.y-(my.sprite.player.displayHeight/2), "bullet2");
                    }
                    else if(randomBullet < 0.75){
                        my.sprite.food = this.add.sprite(my.sprite.player.x, my.sprite.player.y-(my.sprite.player.displayHeight/2), "bullet3");
                    }
                    else if(randomBullet < 1){
                        my.sprite.food = this.add.sprite(my.sprite.player.x, my.sprite.player.y-(my.sprite.player.displayHeight/2), "bullet4");
                    }
                    my.sprite.food.setScale(0.65);
                    my.sprite.bullet.push(my.sprite.food);
                }
                this.start = true;
            }
            //press p to pause/unpause
            if (Phaser.Input.Keyboard.JustDown(this.PKey)) {
                if(this.start == false){
                    this.start = true;
                }
                else{
                    this.start = false;
                }
            }
        }
        //if game isn't running
        if(this.start == false){
            //TITLE/PAUSE TEXT
            //if title hasnt showed yet
            if(this.title == false && this.textDisplay == true){
                this.titleText1.setVisible(true);
                this.titleText2.setVisible(true);
                this.titleText3.setVisible(true);
                this.titleText4.setVisible(true);
                this.title = true;
            }
            //if title has showed and game has been paused
            else if(this.title == true && this.textDisplay == false){
                this.pauseGameText1.setVisible(true);
                this.pauseGameText2.setVisible(true);
                this.textDisplay = true;
            }
        }
        if(this.start == true){
            //TITLE/PAUSE TEXT
            //if title screen still showing, remove upon starting game
            if(this.title == true){
                this.titleText1.setVisible(false);
                this.titleText2.setVisible(false);
                this.titleText3.setVisible(false);
                this.titleText4.setVisible(false);
            }
            //hide pause screen
            if(this.textDisplay == true){
                this.pauseGameText1.setVisible(false);
                this.pauseGameText2.setVisible(false);
            }
            this.textDisplay = false;

            //RESETTING PROJECTILES
            //reset bullets
            my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight/2));
            //reset poops
            for (let duck of my.sprite.whiteDucks){
                duck.poops = duck.poops.filter((poops) => poops.y > -750);
            }

            //PLAYER COLLISION
            //player and yellow duck collision
            for (let duck of my.sprite.yellowDucks){
                if (this.collides(duck, my.sprite.player)){
                    this.puff = this.add.sprite(duck.x, duck.y, "greyPuff2").play("greyPuff");
                    duck.visible = false;
                    duck.x = -100;
                    this.myHealth -= 2;
                    this.updateHealth();
                    // Play sound
                    this.sound.play("pop", {
                        volume: 0.5   // Can adjust volume using this, goes from 0 to 1
                    });
                }
            }
            //player and brown duck collision
            for (let duck of my.sprite.brownDucks){
                if (this.collides(duck, my.sprite.player)){
                    this.puff = this.add.sprite(duck.x, duck.y, "greyPuff2").play("greyPuff");
                    duck.visible = false;
                    duck.x = -100;
                    this.myHealth -= 20;
                    this.updateHealth();// Play sound
                    this.sound.play("pop", {
                        volume: 0.5   // Can adjust volume using this, goes from 0 to 1
                    });
                }
            }
            //player and poop collision
            for (let duck of my.sprite.whiteDucks){
                for (let poop of duck.poops){
                    if (this.collides(poop, my.sprite.player)){
                        this.puff = this.add.sprite(my.sprite.player.x, my.sprite.player.y, "greyPuff2").play("greyPuff");
                        poop.visible = false;
                        poop.x = -100;
                        this.myHealth -= 2;
                        this.updateHealth();
                        // Play sound
                        this.sound.play("drop", {
                            volume: 1   // Can adjust volume using this, goes from 0 to 1
                        });
                    }
                }
            }

            //BULLET COLLISION
            //bullet and duck collision
            for (let bullet of my.sprite.bullet) {
                //check yellowDucks
                for (let duck of my.sprite.yellowDucks){
                    if (this.collides(duck, bullet)) {
                        // start animation
                        this.puff = this.add.sprite(duck.x, duck.y, "puff2").play("puff");
                        // clear out bullet -- put y offscreen, will get reaped next update
                        bullet.y = -100;
                        duck.visible = false;
                        duck.x = -100;
                        // Update score
                        this.myScore += 1;
                        this.updateScore();
                        this.ducksFed += 1;
                        // Play sound
                        this.sound.play("pop", {
                            volume: 0.2   // Can adjust volume using this, goes from 0 to 1
                        });
                    }
                }
                //check brownDucks
                for (let duck of my.sprite.brownDucks){
                    if (this.collides(duck, bullet)) {
                        // start animation
                        this.puff = this.add.sprite(duck.x, duck.y, "puff2").play("puff");
                        // clear out bullet -- put y offscreen, will get reaped next update
                        bullet.y = -100;
                        duck.visible = false;
                        duck.x = -100;
                        // Update score
                        this.myScore += 3;
                        this.updateScore();
                        this.ducksFed += 1;
                        // Play sound
                        this.sound.play("pop", {
                            volume: 0.2   // Can adjust volume using this, goes from 0 to 1
                        });
                    }
                }
                //check whiteDucks
                for (let duck of my.sprite.whiteDucks){
                    if (this.collides(duck, bullet)) {
                        // start animation
                        this.puff = this.add.sprite(duck.x, duck.y, "puff2").play("puff");
                        console.log("white duck fed");
                        // clear out bullet -- put y offscreen, will get reaped next update
                        bullet.y = -100;
                        duck.visible = false;
                        duck.x = -100;
                        duck.poop = false;
                        // Update score
                        this.myScore += 7;
                        this.updateScore();
                        this.ducksFed += 1;
                        // Play sound
                        this.sound.play("pop", {
                            volume: 0.2   // Can adjust volume using this, goes from 0 to 1
                        });
                    }
                }
            }
            //BULLET AND DUCK MOVEMENT
            //make bullet fly up
            if (this.gameOver == false){
                for (let bullet of my.sprite.bullet) {
                    bullet.y -= this.bulletSpeed;
                }
                //make yellow ducks fly down
                for (let duck of my.sprite.yellowDucks) {
                    if(duck.y < 750){
                        duck.y += this.duckSpeed;
                    }
                }
                //make brown ducks fly down
                for (let duck of my.sprite.brownDucks) {
                    if(duck.y < 750){
                        duck.y += this.duckSpeed+1;
                    }
                }
                //make white ducks fly side to side + shoot projectiles
                for (let duck of my.sprite.whiteDucks){
                    if(duck.poop == true){
                        duck.poopTimer += 1;
                        duck.x += (this.duckSpeed+7)*duck.Velocity;
                        if (duck.x < 70) {
                            duck.Velocity = 1;
                        }
                        else if (duck.x > 500) {
                            duck.Velocity = -1;
                        }
                        if(duck.poopTimer == 35){
                            duck.poops.push(this.add.sprite(duck.x, duck.y-(duck.displayHeight/2), "poop"));
                            duck.poopTimer = 0;
                        }
                        for (let poop of duck.poops) {
                            poop.visible = true;
                            poop.y += this.poopSpeed;
                        }
                    }
                    else{
                        for (let poop of duck.poops){
                            poop.visible = false;
                        }
                    }
                }
            }

            //TRACKING WAVES
            for(let duck of my.sprite.yellowDucks){
                if(duck.y > 750){
                    duck.visible = false;
                }
            }
            //use dummy ducks to track wave 1
            if(this.waveComplete(my.sprite.wave1, my.sprite.yellowDucks) == false){
                if(this.wave1 == false){
                    my.sprite.wave1.y += this.duckSpeed;
                }
            }
            //use dummy ducks to track wave 2
            if(this.wave1 == true && this.waveComplete(my.sprite.wave2, my.sprite.yellowDucks) == false){
                if(this.wave2 == false){
                    my.sprite.wave2.y += this.duckSpeed;
                }
            }
            //use dummy ducks to track wave 3
            if(this.wave2 == true && this.waveComplete(my.sprite.wave3, my.sprite.yellowDucks) == false){
                if(this.wave3 == false){
                    my.sprite.wave3.y += this.duckSpeed;
                }
            }
            //WAVE STARTS
            //WAVE 1
            if(this.gameOver == false && this.waveStart == false){
                this.waveStart = true;
                this.wave1Text.visible = true;
                for(let i = 0; i < 450; i+=50){
                    if(i == 100){
                        my.sprite.brownDucks.push(this.add.sprite(80+i, 250, "brownDuck").setScale(0.4));
                        continue;
                    }
                    my.sprite.yellowDucks.push(this.add.sprite(80+i, 250, "yellowDuck").setScale(0.4));
                }
                for(let i = 0; i < 400; i+=50){
                    if(i == 350){
                        my.sprite.brownDucks.push(this.add.sprite(105+i, 205, "brownDuck").setScale(0.4));
                        continue;
                    }
                    my.sprite.yellowDucks.push(this.add.sprite(105+i, 205, "yellowDuck").setScale(0.4));
                }
                for(let i = 0; i < 450; i+=50){
                    my.sprite.yellowDucks.push(this.add.sprite(80+i, 160, "yellowDuck").setScale(0.4));
                }
                for(let i = 0; i < 400; i+=50){
                    //add brown duck
                    if(i == 0){
                        my.sprite.brownDucks.push(this.add.sprite(105+i, 115, "brownDuck").setScale(0.4));
                        continue;
                    }
                    my.sprite.yellowDucks.push(this.add.sprite(105+i, 115, "yellowDuck").setScale(0.4));
                }
                //create white ducks and poop arrays
                my.sprite.whiteDucks.push(this.add.sprite(290, 60, "whiteDuck").setScale(0.4));
                for(let duck of my.sprite.whiteDucks){
                    duck.poops = [];
                    duck.poop = true;
                    duck.Velocity = 1;
                    duck.poopTimer = 0;
                }
            }
            //WAVE 2
            if(this.gameOver == false && this.wave1 == false && this.waveComplete(my.sprite.wave1, my.sprite.yellowDucks) == true){
                this.wave1Text.visible = false;
                this.wave2Text.visible = true;
                //remove white ducks
                for (let duck of my.sprite.whiteDucks){
                    duck.visible = false;
                    duck.x = -100;
                    for (let poop of duck.poops){
                        poop.visible = false;
                    }
                }
                my.sprite.whiteDucks = []; //reset white duck array
                this.wave1 = true; //wave 1 has been completed
                for(let i = 0; i < 450; i+=50){
                    if(i == 100){
                        my.sprite.brownDucks.push(this.add.sprite(80+i, 260, "brownDuck").setScale(0.4));
                        continue;
                    }
                    my.sprite.yellowDucks.push(this.add.sprite(80+i, 260, "yellowDuck").setScale(0.4));
                }
                for(let i = 0; i < 400; i+=50){
                    my.sprite.yellowDucks.push(this.add.sprite(105+i, 215, "yellowDuck").setScale(0.4));
                }
                for(let i = 0; i < 450; i+=50){
                    if(i == 400){
                        my.sprite.brownDucks.push(this.add.sprite(80+i, 170, "brownDuck").setScale(0.4));
                        continue;
                    }
                    my.sprite.yellowDucks.push(this.add.sprite(80+i, 170, "yellowDuck").setScale(0.4));
                }
                for(let i = 0; i < 400; i+=50){
                    my.sprite.yellowDucks.push(this.add.sprite(105+i, 125, "yellowDuck").setScale(0.4));
                }
                for(let i = 0; i < 400; i+=50){
                    if(i == 0){
                        my.sprite.brownDucks.push(this.add.sprite(80+i, 80, "brownDuck").setScale(0.4));
                        continue;
                    }
                    if(i == 300){
                        my.sprite.brownDucks.push(this.add.sprite(80+i, 80, "brownDuck").setScale(0.4));
                        continue;
                    }
                    my.sprite.yellowDucks.push(this.add.sprite(80+i, 80, "yellowDuck").setScale(0.4));
                }
                //add two white ducks
                my.sprite.whiteDucks.push(this.add.sprite(50, 60, "whiteDuck").setScale(0.4));
                my.sprite.whiteDucks.push(this.add.sprite(250, 60, "whiteDuck").setScale(0.4));
                for(let duck of my.sprite.whiteDucks){
                    duck.poops = [];
                    duck.poop = true;
                    duck.Velocity = 1;
                    duck.poopTimer = 0;
                }
            }
            //WAVE 3
            if(this.gameOver == false && this.wave2 == false && this.waveComplete(my.sprite.wave2, my.sprite.yellowDucks) == true){
                this.wave2Text.visible = false;
                this.wave3Text.visible = true;
                //remove white ducks
                for (let duck of my.sprite.whiteDucks){
                    duck.visible = false;
                    duck.x = -100;
                    for (let poop of duck.poops){
                        poop.visible = false;
                    }
                }
                my.sprite.whiteDucks = []; //reset white duck array
                this.wave2 = true; //wave 2 has been completed
                //first third
                for(let i = 0; i < 450; i+=50){
                    my.sprite.yellowDucks.push(this.add.sprite(80+i, 260, "yellowDuck").setScale(0.4));
                }
                for(let i = 0; i < 400; i+=50){
                    if(i == 300){
                        my.sprite.brownDucks.push(this.add.sprite(105+i, 260, "brownDuck").setScale(0.4));
                        continue;
                    }
                    my.sprite.yellowDucks.push(this.add.sprite(105+i, 215, "yellowDuck").setScale(0.4));
                }
                for(let i = 0; i < 450; i+=50){
                    if(i == 50){
                        my.sprite.brownDucks.push(this.add.sprite(80+i, 170, "brownDuck").setScale(0.4));
                        continue;
                    }
                    my.sprite.yellowDucks.push(this.add.sprite(80+i, 170, "yellowDuck").setScale(0.4));
                }
                for(let i = 0; i < 400; i+=50){
                    if(i == 250){
                        my.sprite.brownDucks.push(this.add.sprite(105+i, 125, "brownDuck").setScale(0.4));
                        continue;
                    }
                    my.sprite.yellowDucks.push(this.add.sprite(105+i, 125, "yellowDuck").setScale(0.4));
                }
                for(let i = 0; i < 400; i+=50){
                    if(i == 250){
                        my.sprite.brownDucks.push(this.add.sprite(80+i, 80, "brownDuck").setScale(0.4));
                        continue;
                    }
                    my.sprite.yellowDucks.push(this.add.sprite(80+i, 80, "yellowDuck").setScale(0.4));
                }
                //second third
                for(let i = 0; i < 400; i+=50){
                    if(i == 100){
                        my.sprite.brownDucks.push(this.add.sprite(80+i, -20, "brownDuck").setScale(0.4));
                        continue;
                    }
                    my.sprite.yellowDucks.push(this.add.sprite(80+i, -20, "yellowDuck").setScale(0.4));
                }
                for(let i = 0; i < 400; i+=50){
                    if(i == 50){
                        my.sprite.brownDucks.push(this.add.sprite(105+i, -65, "brownDuck").setScale(0.4));
                        continue;
                    }
                    my.sprite.yellowDucks.push(this.add.sprite(105+i, -65, "yellowDuck").setScale(0.4));
                }
                for(let i = 0; i < 400; i+=50){
                    if(i == 350){
                        my.sprite.brownDucks.push(this.add.sprite(80+i, -110, "brownDuck").setScale(0.4));
                        continue;
                    }
                    my.sprite.yellowDucks.push(this.add.sprite(80+i, -110, "yellowDuck").setScale(0.4));
                }
                //third third
                for(let i = 0; i < 400; i+=50){
                    if(i == 100){
                        my.sprite.brownDucks.push(this.add.sprite(80+i, -170, "brownDuck").setScale(0.4));
                        continue;
                    }
                    my.sprite.yellowDucks.push(this.add.sprite(80+i, -170, "yellowDuck").setScale(0.4));
                }
                for(let i = 0; i < 400; i+=50){
                    if(i == 50){
                        my.sprite.brownDucks.push(this.add.sprite(105+i, -215, "brownDuck").setScale(0.4));
                        continue;
                    }
                    my.sprite.yellowDucks.push(this.add.sprite(105+i, -215, "yellowDuck").setScale(0.4));
                }
                for(let i = 0; i < 400; i+=50){
                    if(i == 350){
                        my.sprite.brownDucks.push(this.add.sprite(80+i, -260, "brownDuck").setScale(0.4));
                        continue;
                    }
                    my.sprite.yellowDucks.push(this.add.sprite(80+i, -260, "yellowDuck").setScale(0.4));
                }
                for(let i = 0; i < 400; i+=50){
                    my.sprite.yellowDucks.push(this.add.sprite(105+i, -305, "yellowDuck").setScale(0.4));
                }
                //add two white ducks
                my.sprite.whiteDucks.push(this.add.sprite(20, 60, "whiteDuck").setScale(0.4));
                my.sprite.whiteDucks.push(this.add.sprite(150, 60, "whiteDuck").setScale(0.4));
                my.sprite.whiteDucks.push(this.add.sprite(300, 60, "whiteDuck").setScale(0.4));
                let i = 0;
                for(let duck of my.sprite.whiteDucks){
                    duck.poops = [];
                    duck.poop = true;
                    duck.Velocity = 1;
                    duck.poopTimer = i;
                    i += 10;
                }
            }
            //check if wave 3 has completed and empty white duck array
            if(this.gameOver == false && this.wave2 == true && this.waveComplete(my.sprite.wave3, my.sprite.yellowDucks) == true){
                //remove white ducks
                for (let duck of my.sprite.whiteDucks){
                    duck.visible = false;
                    duck.x = -100;
                    for (let poop of duck.poops){
                        poop.visible = false;
                    }
                }
                my.sprite.whiteDucks = [];
                this.wave3 = true;
            }
            //if health drops to 0, lose game
            if(this.myHealth <= 0){
                this.loseGame();
            }
            //if all waves completed, win game
            if(this.wave3 == true){
                this.winGame();
            }
        }
    }
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.myScore);
    }

    updateHealth() {
        let my = this.my;
        my.text.health.setText("Health " + this.myHealth);
    }

    waveComplete(dummyDuck, duckArray){
        if(dummyDuck.y >= 720){
            return true;
        }
        for(let duck of duckArray){
            if(duck.visible == true){
                return false;
            }
        }
        return true;
    }

    loseGame(){
        let my = this.my;
        this.loseGameText1.visible = true;
        this.loseGameText2.setText("You fed " + this.ducksFed + " ducks!");
        this.loseGameText2.visible = true;
        this.loseGameText3.visible = true;
        this.myHealth = 0;
        this.updateHealth();
        this.clearDucks(my.sprite.yellowDucks);
        this.clearDucks(my.sprite.brownDucks);
        this.clearDucks(my.sprite.whiteDucks);
        this.gameOver = true;
        this.textDisplay = true;
        for(let bullet of my.sprite.bullet){
            bullet.visible = false;
        }
        for (let duck of my.sprite.whiteDucks){
            duck.visible = false;
            duck.x = -100;
            for (let poop of duck.poops){
                poop.visible = false;
            }
        }
        my.sprite.whiteDucks = [];
        this.gameWon = false;
    }

    winGame(){
        let my = this.my;
        this.winGameText1.visible = true;
        this.winGameText2.setText("You fed " + this.ducksFed + " ducks!");
        this.winGameText2.visible = true;
        this.winGameText3.visible = true;
        this.clearDucks(my.sprite.yellowDucks);
        this.clearDucks(my.sprite.brownDucks);
        this.clearDucks(my.sprite.whiteDucks);
        this.gameOver = true;
        this.textDisplay = true;
        for(let bullet of my.sprite.bullet){
            bullet.visible = false;
        }
        for (let duck of my.sprite.whiteDucks){
            duck.visible = false;
            duck.x = -100;
            for (let poop of duck.poops){
                poop.visible = false;
            }
        }
        my.sprite.whiteDucks = [];
        this.gameWon = true;
    }

    clearDucks(duckArray){
        for(let duck of duckArray){
            this.puff = this.add.sprite(duck.x, duck.y, "puff2").play("puff");
            duck.visible = false;
            duck.x = -100;
            if(duck.poops != undefined){
                for (let poop of duck.poops){
                    poop.visible = false;
                }
            }
        }
    }

}