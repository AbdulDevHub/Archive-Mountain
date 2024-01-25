"""
Title: Space Invaders
Description: Interactive & Enhanced Game of Space Invaders
Authors: Abdul Khan & Uzair
Last Modified: Feb 28, 2023
"""

import pygame
import random
import time
from tkinter import *

# Screen Dimensions
WIDTH = 840
HEIGHT = 680
screen = pygame.display.set_mode([WIDTH, HEIGHT])

# Special bullets attack pattern coordinates
scatterBulletCoordinates = ((-2, 20), (13, 10), (50, 10), (65, 20))
multiBulletCoordinates = ((2, 17), (16, 8), (54, 8), (68, 17))
bossBulletCoordinates = ((10, 187), (57, 216), (100, 225), (166, 260), (233, 225), (277, 216), (325, 187))

# Different time frames within game
startTime = shieldStartTime = multiShotStartTime = None

# Default Game Difficulty & Music
difficulty = 1
bossMusicPlaying = False


#-----------------------------
#        Game Classes
#-----------------------------

class Player(pygame.sprite.Sprite):
    """ This class represents the Player. """

    def __init__(self):
        """ Set up the player on creation. """
        # Call constructor and load image
        super().__init__()
        self.image = pygame.image.load("gameAssets/playerShip.png")
        self.image = pygame.transform.scale(self.image, (80, 80))
        self.rect = self.image.get_rect()

        # Player Related Starting Values
        self.rect.y = HEIGHT - self.rect.height * 2
        self.lives = 3

        # Special Bullet Related Starting Values
        self.activeBuffs = []
        self.bulletType = ["normal"]
        self.asteroid = 0
        self.shield = False
        self.multiShotActive = False
        self.occurrence = 0

    def update(self):
        """ Update the player's position. """
        # Set player x position to mouse x position
        self.rect.x = pygame.mouse.get_pos()[0]

        # Give player buffs depending on power-ups collected
        self.lives += self.activeBuffs.count("Health")         # Health Buff

        for _ in range(self.activeBuffs.count("Bullet")):      # Bullet Buff
            # Randomly select type of special bullet to shoot
            bulletType = random.randint(0, 2)
            if bulletType == 0:
                self.bulletType.append("multi-shot")
                global multiShotStartTime
                multiShotStartTime = time.time()
                self.multiShotActive = True
            elif bulletType == 1: self.bulletType.append("scatter")
            else: self.bulletType.append("laser")

        if "Shield" in self.activeBuffs:                       # Shield Buff
            self.shield = True
            # Start shield timer
            global shieldStartTime
            shieldStartTime = time.time()

        for _ in range(self.activeBuffs.count("Asteroid")):    # Asteroid Buff
            self.bulletType.append("asteroid")

        # All power-ups have been used up
        self.activeBuffs = []

        # Leave shield activated for 5 seconds
        if self.shield:
            if time.time() - shieldStartTime > 5: self.shield = False

        # Keep shooting multi-shot bullet for 3 seconds
        if self.multiShotActive:
            if time.time() - multiShotStartTime > 3:
                self.multiShotActive = False
                self.occurrence = 0
            # Shoot one set of multi-shot bullet 2x a second
            if time.time() - multiShotStartTime > (1 / 2 * self.occurrence):
                self.bulletType.append("multi-shot")
                self.occurrence += 1


class Bullet(pygame.sprite.Sprite):
    """ This class represents the bullet . """

    def __init__(self, x, y, direction=1, bulletType="normal", scatterDir=0):
        # Call constructor
        super().__init__()

        # Select bullet image based on bulletType & shooter
        # Default: Player Bullet Image
        image = "normalBullet.png"
        imageWidth = 10
        imageHeight = 25

        # Special Player Bullets
        if bulletType == "scatter":
            image = "scatterBullet.png"
            imageWidth = 15
            imageHeight = 15
        elif bulletType == "laser":
            image = "laserBullet.png"
            imageWidth = 10
            imageHeight = 50
        elif bulletType == "asteroid":
            image = "asteroid.png"
            imageWidth = 40
            imageHeight = 30
            self.rightSpawnAsteroid = direction  # 1 Represents True

        # Enemy Bullet
        elif direction == -1:
            image = "enemyBullet.png"
            imageWidth = 15
            imageHeight = 15

        # Load bullet image
        self.image = pygame.image.load("gameAssets/" + image)
        self.image = pygame.transform.scale(self.image, (imageWidth, imageHeight))
        self.rect = self.image.get_rect()

        # Set in-game location and direction of bullet
        self.direction = direction
        self.rect.x = x
        self.rect.y = y
        self.bulletType = bulletType
        self.scatterDir = scatterDir

        if bulletType == "asteroid": self.asteroidStartY = y

    def update(self):
        """ Move the various types of bullet. """
        if self.bulletType == "normal": self.rect.y -= self.direction * 3
        elif self.bulletType == "multi-shot": self.rect.y -= 3
        elif self.bulletType == "laser": self.rect.y -= 2
        elif self.bulletType == "scatter":
            self.rect.y -= 3
            self.rect.x += self.scatterDir
        elif self.bulletType == "asteroid":
            # Randomly select speed of asteroid
            xSpeed = random.randint(1, 5)
            ySpeed = random.randint(1, 5)

            # Move asteroid in specific direction based on starting location
            if self.rightSpawnAsteroid:  # Starts from right side
                self.rect.x -= xSpeed  # Move right
            else:
                self.rect.x += xSpeed  # Move Left

            if self.asteroidStartY <= HEIGHT/2:  # Starts from top
                self.rect.y += ySpeed  # Move down
            else:
                self.rect.y -= ySpeed  # Move up


class PowerUp(pygame.sprite.Sprite):
    """
    This class represents the 4 types of power-ups dropped by enemies & boss.
    """

    def __init__(self, powerUpType, x, y):
        # Call constructor
        super().__init__()

        # Select image based on type of power-up
        self.type = powerUpType
        image = ""
        if powerUpType == 0:
            image = "healthPowerUp.png"
            self.type = "Health"
        elif powerUpType == 1:
            image = "bulletPowerUp.png"
            self.type = "Bullet"
        elif powerUpType == 2:
            image = "shieldPowerUp.png"
            self.type = "Shield"
        elif powerUpType == 3:
            image = "asteroidPowerUp.png"
            self.type = "Asteroid"

        # Load selected image
        self.image = pygame.image.load("gameAssets/" + image)
        self.image = pygame.transform.scale(self.image, (30, 30))
        self.rect = self.image.get_rect()

        # Set in-game location of power-up
        self.rect.x = x
        self.rect.y = y
        self.direction = -3

    def update(self):
        """ Make the power-up fall. """
        self.rect.y -= self.direction


class PlayerHealth(pygame.sprite.Sprite):
    """ This class represents the player hearts . """

    def __init__(self, x):
        # Call constructor and load image
        super().__init__()
        self.image = pygame.image.load("gameAssets/playerHearts.png")
        self.image = pygame.transform.scale(self.image, (20, 20))
        self.rect = self.image.get_rect()

        # Set location for hearts of player
        self.rect.y = HEIGHT - 50
        self.rect.x = x


class BossHealthBar(pygame.sprite.Sprite):
    """ This class represents the boss's health bar . """

    def __init__(self, enemyBoss):
        # Call constructor and load image
        super().__init__()
        self.width, self.height = 33 * 15, 15
        self.image = pygame.Surface([self.width, self.height])
        self.image.fill(pygame.color.THECOLORS['red'])
        self.rect = self.image.get_rect()

        # Set boss health bar's in-game location
        self.rect.x = 222
        self.rect.y = 52.5

        # Alias health bar to match boss's health
        self.enemyBoss = enemyBoss

    def update(self):
        # Shrink health bar as boss gets hit
        self.width = self.enemyBoss.health * 15 / difficulty
        self.image = pygame.Surface([self.width, self.height])
        self.image.fill(pygame.color.THECOLORS['red'])


class Enemy(pygame.sprite.Sprite):
    """ This class represents the smaller in-game enemies. """

    def __init__(self, spawnEnemy=False):
        # Call constructor and load image
        super().__init__()
        self.image = pygame.image.load("gameAssets/enemyShip.png")
        self.image = pygame.transform.scale(self.image, (50, 40))
        self.rect = self.image.get_rect()

        # Set enemy's in-game location randomly on screen
        self.rect.x = random.randint(20, WIDTH - 20)
        self.rect.y = random.randint(0, HEIGHT // 2)

        # Determine if its a newly spawned type of enemy
        self.spawnEnemy = False
        if spawnEnemy:
            self.spawnEnemy = True
            self.destination = self.rect.y
            self.rect.y = -21

        self.movement = 3

    def update(self):
        """ Move the enemy. """
        # Make spawn enemy descend for firing range
        if self.spawnEnemy:
            self.rect.y += 3
            if self.rect.y >= self.destination: self.spawnEnemy = False

        # Move enemy right and left
        if not self.spawnEnemy:
            if self.rect.x >= WIDTH or self.rect.x <= 0:
                self.rect.y += self.rect.height
                self.movement *= -1
            self.rect.x += self.movement


class EnemyBoss(pygame.sprite.Sprite):
    """ This class represents the enemy boss. """

    def __init__(self, player):
        # Call constructor and load image
        super().__init__()
        self.image = pygame.image.load("gameAssets/bossShip.png")
        self.image = pygame.transform.scale(self.image, (350, 300))
        self.rect = self.image.get_rect()

        # Set boss's in-game location
        self.rect.x = WIDTH/2 - 175
        self.rect.y = -300

        # Limit boss's hit area - improves visual hit animation
        self.rect.height = 200
        self.rect.width = 350

        # Set boss's functional values
        self.movement = 3
        self.player = player
        self.health = 33 * difficulty
        self.status = "Inactive"

    def update(self):
        """ Move the enemy boss. """
        # Make boss descend for firing range
        if self.status == "Descend": self.rect.y += 3

        # Seek player for attack
        elif self.status == "Active":
            distance = abs(self.player.rect.x - self.rect.x - 135)

            # Only move if player is far enough away
            if distance >= 3:
                if self.player.rect.x - 135 > self.rect.x: self.rect.x += self.movement
                elif self.player.rect.x - 135 < self.rect.x: self.rect.x -= self.movement


class Game:
    """ This class represents the Game. It contains all the game objects. """

    def __init__(self):
        """ Initialize and set up the starting game objects. """

        # Set up Pygame & window
        pygame.init()
        self.screenWidth = WIDTH
        self.screenHeight = HEIGHT
        self.screen = screen

        # Set up game background
        backgroundImage = pygame.image.load("gameAssets/galaxyBackground.jpg")
        self.backgroundImage = pygame.transform.scale(backgroundImage, (WIDTH, HEIGHT))

        # Set up starting game values
        self.wonGame = False
        self.quit = False

        self.totalEnemies = 50 * difficulty
        self.enemyStartNum = 33
        self.enemyShootChance = 1
        self.score = 0

        global startTime
        startTime = time.time()

        self.player = Player()
        self.enemyBoss = EnemyBoss(self.player)

        # Set up sprite lists
        self.allSpritesList = pygame.sprite.Group()
        self.enemyList = pygame.sprite.Group()
        self.playerBulletList = pygame.sprite.Group()
        self.enemyBulletList = pygame.sprite.Group()
        self.powerUpList = pygame.sprite.Group()
        self.playerHeartList = pygame.sprite.Group()

        # Initialize starting enemies & place them in list
        self.totalEnemies -= self.enemyStartNum
        for _ in range(self.enemyStartNum):
            enemy = Enemy()
            self.enemyList.add(enemy)
            self.allSpritesList.add(enemy)

        # Place player and boss in allSpritesList
        self.allSpritesList.add(self.player)
        self.allSpritesList.add(self.enemyBoss)

    def poll(self):
        for event in pygame.event.get():
            # Quit game if user closes window
            if event.type == pygame.QUIT:
                self.quit = True

            elif event.type == pygame.MOUSEBUTTONDOWN:
                # Fire bullet if user clicks mouse
                bullet = Bullet(self.player.rect.x + 35, self.player.rect.y - 20)
                # Add fired bullet to lists
                self.allSpritesList.add(bullet)
                self.playerBulletList.add(bullet)

    def update(self) -> bool:
        """ Updates game state & returns value indicating whether game should continue"""
        continueGame = True

        # Give every enemy a random chance of firing a bullet
        for enemy in self.enemyList:
            if random.randint(1, 1000) <= self.enemyShootChance:
                x = (enemy.rect.x + enemy.rect.width / 2) - 8
                y = (enemy.rect.y + enemy.rect.height) - 13
                bullet = Bullet(x, y, -1)
                self.enemyBulletList.add(bullet)
                self.allSpritesList.add(bullet)

        # Activate boss
        if len(self.enemyList) == 0:
            # Make him descend
            if self.enemyBoss.status != "Active":
                self.enemyBoss.status = "Descend"

                # Play boss music!
                playMusic(True)
                global bossMusicPlaying
                bossMusicPlaying = True

                # Reached firing range
                if self.enemyBoss.rect.y >= 75:
                    self.enemyBoss.status = "Active"
                    self.allSpritesList.add(BossHealthBar(self.enemyBoss))

            # Shoot bullets once firing range reached
            if self.enemyBoss.status == "Active":
                # Give its 7 cannons a random chance of firing
                for i, coordinate in enumerate(bossBulletCoordinates, start=1):
                    # Create bullet but don't fire it yet
                    x = self.enemyBoss.rect.x + coordinate[0]
                    y = self.enemyBoss.rect.y + coordinate[1]
                    bullet = Bullet(x, y, -1)

                    # Fire randomly based on cannon location
                    firingChance = random.randint(0, 5000)
                    if i == 4 and firingChance <= 75:  # Middle/Main Cannon - 1.5% firing chance
                        self.allSpritesList.add(bullet)
                        self.enemyBulletList.add(bullet)
                    elif (i == 3 or i == 5) and firingChance <= 50:  # Inner Cannons - 1% firing chance
                        self.allSpritesList.add(bullet)
                        self.enemyBulletList.add(bullet)
                    elif (i == 2 or i == 6) and firingChance <= 25:  # Secondary Cannons - 0.5% firing chance
                        self.allSpritesList.add(bullet)
                        self.enemyBulletList.add(bullet)
                    elif (i == 1 or i == 7) and firingChance <= 12:  # Outer Cannons - 0.24% firing chance
                        self.allSpritesList.add(bullet)
                        self.enemyBulletList.add(bullet)

        # Shoot special player bullets
        if not self.player.bulletType == ["normal"]:
            # Fire special bullets accumulated through bullet power-up
            for i in range(1, len(self.player.bulletType)):
                bullet = self.player.bulletType[i]

                # Fire multi-shot bullet
                if bullet == "multi-shot":
                    # Equivalent to shooting normal bullet multiple times
                    for coordinate in multiBulletCoordinates:
                        x = self.player.rect.x + coordinate[0]
                        y = self.player.rect.y + coordinate[1]
                        bullet = Bullet(x, y, 1, "normal")
                        self.allSpritesList.add(bullet)
                        self.playerBulletList.add(bullet)

                # Fire scatter bullet
                elif bullet == "scatter":
                    # Shoots multiple instances of bullet over large area
                    for coordinate in scatterBulletCoordinates:
                        for j in range(-1, 2):
                            x = self.player.rect.x + coordinate[0]
                            y = self.player.rect.y + coordinate[1]
                            bullet = Bullet(x, y, 1, "scatter", j)
                            self.allSpritesList.add(bullet)
                            self.playerBulletList.add(bullet)

                # Fire laser bullet
                elif bullet == "laser":
                    x = self.player.rect.x + 35
                    y = self.player.rect.y - 20
                    bullet = Bullet(x, y, 1, "laser")
                    self.playerBulletList.add(bullet)
                    self.allSpritesList.add(bullet)

                # Create moving asteroid
                elif bullet == "asteroid":
                    # Create asteroid right/left side of screen and move towards game screen
                    rightAsteroid = random.randint(0, 1)
                    y = random.randint(40, HEIGHT - 40)
                    x = -20
                    if rightAsteroid: x = WIDTH + 20
                    bullet = Bullet(x, y, rightAsteroid, "asteroid")

                    # Can harm both player and enemies
                    self.playerBulletList.add(bullet)
                    self.enemyBulletList.add(bullet)
                    self.allSpritesList.add(bullet)

            # Return player to shooting normal bullets
            self.player.bulletType = ["normal"]

        # Update status/values of all sprites
        self.allSpritesList.update()

        # Remove enemies that reach bottom of screen
        for enemy in self.enemyList:
            if enemy.rect.y > HEIGHT:
                self.enemyList.remove(enemy)
                self.allSpritesList.remove(enemy)

        # Calculate mechanics for player bullets
        for bullet in self.playerBulletList:
            # Remove enemies hit by bullet
            enemyHitList = pygame.sprite.spritecollide(bullet, self.enemyList, True)

            # If enemy hit, remove the bullet and add to the score
            if len(enemyHitList) > 0:
                self.score += len(enemyHitList)
                # Laser & asteroid can kill multiple enemies without self-destructing
                if not (bullet.bulletType == "laser" or bullet.bulletType == "asteroid"):
                    self.playerBulletList.remove(bullet)
                    self.allSpritesList.remove(bullet)

            # Spawn new enemies as enemies are killed - doesn't go over total game enemies
            deadEnemies = len(enemyHitList)
            while deadEnemies > 0 and self.totalEnemies > 0:
                enemy = Enemy(spawnEnemy=True)
                self.enemyList.add(enemy)
                self.allSpritesList.add(enemy)
                self.totalEnemies -= 1
                deadEnemies -= 1

            # Randomly creates power-ups as enemies are killed
            for enemy in enemyHitList:
                powerUpChance = random.randint(0, 30)
                if powerUpChance <= 3:
                    powerUP = PowerUp(powerUpChance, enemy.rect.x, enemy.rect.y)
                    self.powerUpList.add(powerUP)
                    self.allSpritesList.add(powerUP)

            # Remove the bullet if it flies up off the screen
            if bullet.rect.y < (0 - bullet.rect.height):
                self.playerBulletList.remove(bullet)
                self.allSpritesList.remove(bullet)

        # Remove enemy ship and reduce player life if they collide
        collisionHitList = pygame.sprite.spritecollide(self.player, self.enemyList, True)
        for enemy in collisionHitList:
            self.allSpritesList.remove(enemy)
        if not self.player.shield: self.player.lives -= len(collisionHitList)

        # Boss & player bullet collision mechanics
        bossHitList = pygame.sprite.spritecollide(self.enemyBoss, self.playerBulletList, True)
        # Only damage or collect power-ups from boss if he's active
        if self.enemyBoss.status == "Active":
            for bullet in bossHitList:
                # Remove bullets that hit boss
                self.allSpritesList.remove(bullet)

                # Randomly creates power-ups as boss is hit
                powerUpChance = random.randint(0, 30)
                if powerUpChance <= 3:
                    powerUP = PowerUp(powerUpChance, bullet.rect.x, bullet.rect.y + 50)
                    self.powerUpList.add(powerUP)
                    self.allSpritesList.add(powerUP)
            # Reduce boss's health per bullet hit
            self.enemyBoss.health -= len(bossHitList)

        # Remove all collected power-ups and enhance the player
        powerUpCollectList = pygame.sprite.spritecollide(self.player, self.powerUpList, True)
        for powerUP in powerUpCollectList:
            self.allSpritesList.remove(powerUP)
            self.player.activeBuffs.append(powerUP.type)

        # Remove the power-up if it flies off the screen
        for powerUP in self.powerUpList:
            if powerUP.rect.y > (HEIGHT + powerUP.rect.height):
                self.powerUpList.remove(powerUP)
                self.allSpritesList.remove(powerUP)

        # Remove the enemy bullet if it flies off the screen
        for bullet in self.enemyBulletList:
            if bullet.rect.y > (HEIGHT + bullet.rect.height):
                self.enemyBulletList.remove(bullet)
                self.allSpritesList.remove(bullet)

        # Remove enemy bullets that hit player and reduce his life
        collidedBullets = pygame.sprite.spritecollide(self.player, self.enemyBulletList, True)
        if not self.player.shield: self.player.lives -= len(collidedBullets)
        for bullet in collidedBullets: self.allSpritesList.remove(bullet)

        # Player is dead
        if self.player.lives <= 0:
            self.player.lives = 0
            continueGame = False

        # Update hearts that appear on screen to match player's lives
        self.playerHeartList.empty()
        for i in range(self.player.lives): self.playerHeartList.add(PlayerHealth(100 + (50 * i)))

        # Boss is defeated
        if len(self.enemyList) == 0 and self.enemyBoss.health <= 0:
            self.enemyBoss.status = "Dead"
            self.enemyBoss.health = 0
            self.wonGame = True
            continueGame = False

        # Remove all sprites from screen except player and his heart sprites
        if not continueGame:
            newList = pygame.sprite.Group()
            for sprite in self.allSpritesList:
                if sprite == self.player or sprite in self.playerHeartList:
                    newList.add(sprite)
            self.allSpritesList = newList

        return continueGame

    def draw(self):
        # Clear screen & draw background
        self.screen.blit(self.backgroundImage, (0, 0))

        # Draw all sprites
        self.allSpritesList.draw(self.screen)
        self.playerHeartList.draw(self.screen)

        # Draw player shield, if active
        if self.player.shield:
            x = self.player.rect.x
            y = self.player.rect.y
            pygame.draw.circle(self.screen, (135, 206, 235), (x + 40, y + 47), 60, 5)

        # Figure out time elapsed since game start
        elapsedTime = time.time() - startTime
        minute, second = divmod(elapsedTime, 60)

        # Draw on screen text for timer, boss health, and player health
        font = pygame.font.Font(None, 30)
        livesText = font.render("Lives | ", True, (255, 70, 70))
        enemyLivesText = font.render("Imperial Destroyer | ", True, (255, 70, 70))
        timeText = font.render("Time | " + str(int(minute)) + ":" + str(int(second)), True, (0, 255, 255))

        screen.blit(livesText, (20, HEIGHT - 50))
        screen.blit(timeText, (20, HEIGHT - 80))
        if self.enemyBoss.status == "Active":
            screen.blit(enemyLivesText, (20, 50))

    def run(self):
        # Used to manage how fast the screen updates
        clock = pygame.time.Clock()

        # -------- Main Program Loop -----------
        while True:
            self.poll()  # Event processing
            resume = self.update()  # Handle game logic
            self.draw()  # Draw a frame
            pygame.display.flip()  # Update the screen with what we've drawn.
            clock.tick(60)  # Limit the frames per second

            if self.quit: pygame.quit()  # Player close window
            if not resume: break         # Player lost/won game

        bossScore = (33 * difficulty) - self.enemyBoss.health  # Points for every hit dealt to boss
        self.score += (self.player.lives * 5) + bossScore      # Final Score

        # Show end game screen, and end game
        gameOver(self.wonGame, self.score)


#-----------------------------
#       Game Functions
#-----------------------------

def gameOver(won, score):
    """ Display's the end screen for the game. """

    # Set text fonts and size
    titleFont = pygame.font.SysFont('arial', 80)
    endPhraseFont = pygame.font.SysFont('arial', 60)
    scoreTimeFont = pygame.font.SysFont('arial', 40)

    # End screen text & color based on whether player won/lost
    endPhrase = "You Lost!"
    color = (255, 70, 70)
    if won:
        endPhrase = "You Won!"
        color = (20, 255, 122)

    # Calculate time passed since start of game
    elapsedTime = time.time() - startTime
    minute, second = divmod(elapsedTime, 60)

    # Render text
    title = titleFont.render("GAME OVER", True, (0, 255, 255))
    endStatus = endPhraseFont.render(endPhrase, True, color)
    scoreOutput = scoreTimeFont.render("Your Score | " + str(score), True, (255, 255, 255))
    timeOutput = scoreTimeFont.render("Your Time | " + str(int(minute)) + ":" + str(int(second)), True, (255, 255, 255))

    # Draw text on screen
    screen.blit(title, (WIDTH/2 - title.get_width()/2, HEIGHT/2 - title.get_height()/3 - 160))
    screen.blit(endStatus, (WIDTH/2 - endStatus.get_width()/2, HEIGHT/2 - endStatus.get_height()/3 - 70))
    screen.blit(scoreOutput, (WIDTH/2 - scoreOutput.get_width()/2 - 140, HEIGHT/2 - scoreOutput.get_height()/3 + 20))
    screen.blit(timeOutput, (WIDTH/2 - timeOutput.get_width()/2 + 160, HEIGHT/2 - timeOutput.get_height()/3 + 20))

    # Quit game after 7 seconds
    pygame.display.update()
    pygame.time.wait(7000)
    pygame.quit()


def difficultyScreen():
    """ Creates option window user can use to choose game difficulty. """
    root = Tk()
    root.title("Select Difficulty")
    level = 1

    # Set difficulty and close window
    def closeWindow(chosenDifficulty):
        nonlocal level
        level = chosenDifficulty
        root.destroy()

    # Game difficulty options given as 3 buttons
    easyBtn = Button(root, text="Easy", width=10, command=lambda: closeWindow(1), bg="green", fg="white")
    easyBtn.pack(side=LEFT, padx=5, pady=10)

    medBtn = Button(root, text="Medium", width=10, command=lambda: closeWindow(2), bg="yellow", fg="black")
    medBtn.pack(side=LEFT, padx=5, pady=10)

    hardBtn = Button(root, text="Hard", width=10, command=lambda: closeWindow(3), bg="red", fg="white")
    hardBtn.pack(side=LEFT, padx=5, pady=10)

    # Return Difficulty
    root.mainloop()
    return level


def playMusic(finalStage=False):
    """ Play music for the two stages of the game. """

    # Final Boss Stage
    if finalStage and not bossMusicPlaying:
        pygame.mixer.music.stop()
        pygame.mixer.music.load("gameAssets/bossMusic.mp3")
        pygame.mixer.music.play(-1)

    # Main Game Stage
    elif not finalStage:
        pygame.mixer.init()
        pygame.mixer.music.load("gameAssets/gameMusic.mp3")
        pygame.mixer.music.play(-1)


if __name__ == '__main__':
    difficulty = difficultyScreen()  # Comment out this line if getting tkinter errors
    playMusic()
    g = Game()
    g.run()
