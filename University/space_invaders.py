"""
Title: Space Invaders
Description: Interactive and Enhanced Game of Space Invaders
Authors: Abdul Khan & Uzair
Last Modified: Feb 28, 2023
"""

import pygame
import random
import time
from tkinter import *

# Dimensions of the screen
WIDTH = 840
HEIGHT = 680
screen = pygame.display.set_mode([WIDTH, HEIGHT])

# Coordinates of special bullet patterns
scatterBulletCoordinates = ((-2, 20), (13, 10), (50, 10), (65, 20))
multiBulletCoordinates = ((2, 17), (16, 8), (54, 8), (68, 17))
bossBulletCoordinates = ((10, 187), (57, 216), (100, 225), (166, 260), (233, 225), (277, 216), (325, 187))

# Different time frames within the game
start_time = shield_start_time = multi_shot_start_time = None

# Difficulty level
difficulty = 1

# --- Game Classes


class Player(pygame.sprite.Sprite):
    """ This class represents the Player. """

    def __init__(self):
        """ Set up the player on creation. """
        # Call the parent class (Sprite) constructor
        super().__init__()

        self.activeBuffs = []
        self.image = pygame.image.load("player_ship.png")
        self.image = pygame.transform.scale(self.image, (80, 80))
        self.rect = self.image.get_rect()
        self.rect.y = HEIGHT - self.rect.height * 2

        self.bulletType = ["normal"]
        self.asteroid = 0
        self.shield = False
        self.multiShotActive = False
        self.occurence = 0
        self.lives = 3

    def update(self):
        """ Update the player's position. """
        # Get the current mouse position. This returns the position
        # as a list of two numbers.
        pos = pygame.mouse.get_pos()

        # Set the player x position to the mouse x position
        self.rect.x = pos[0]
        if self.rect.x > WIDTH: self.rect.x = WIDTH

        # Give player buffs depending on packs collected
        self.lives += self.activeBuffs.count("Health")
        for _ in range(self.activeBuffs.count("Bullet")):
            bulletType = random.randint(0,2)
            if bulletType == 0:
                self.bulletType.append("multi-shot")
                global multi_shot_start_time
                multi_shot_start_time = time.time()
                self.multiShotActive = True
            elif bulletType == 1: self.bulletType.append("scatter")
            else: self.bulletType.append("laser")
        if "Shield" in self.activeBuffs:
            self.shield = True
            global shield_start_time
            shield_start_time = time.time()
        for _ in range(self.activeBuffs.count("Asteroid")): self.bulletType.append("asteroid")
        self.activeBuffs = []

        if self.shield:
            if time.time() - shield_start_time > 5: self.shield = False
        if self.multiShotActive:
            if time.time() - multi_shot_start_time > 3:
                self.multiShotActive = False
                self.occurence = 0
            if time.time() - multi_shot_start_time > (1/2 * self.occurence):
                self.bulletType.append("multi-shot")
                self.occurence += 1


# Function for the end screen of the game
def gameOver(won, score):
    title_font = pygame.font.SysFont('arial', 80)
    endPhrase_font = pygame.font.SysFont('arial', 60)
    scoreTime_font = pygame.font.SysFont('arial', 40)

    endPhrase = "You Lost!"
    color = (255,70,70)
    if won:
        endPhrase = "You Won!"
        color = (20,255,122)

    title = title_font.render("GAME OVER", True, (0, 255, 255))
    endStatus = endPhrase_font.render(endPhrase, True, color)
    scoreOutput = scoreTime_font.render("Your Score | " + str(score), True, (255, 255, 255))

    elapsed_time = time.time() - start_time
    min, sec = divmod(elapsed_time, 60)
    timeOutput = scoreTime_font.render("Your Time | " + str(int(min)) + ":" + str(int(sec)), True, (255, 255, 255))

    screen.blit(title, (WIDTH/2 - title.get_width()/2, HEIGHT/2 - title.get_height()/3 - 160))
    screen.blit(endStatus, (WIDTH/2 - endStatus.get_width()/2, HEIGHT/2 - endStatus.get_height()/3 - 70))
    screen.blit(scoreOutput, (WIDTH/2 - scoreOutput.get_width()/2 - 140, HEIGHT/2 - scoreOutput.get_height()/3 + 20))
    screen.blit(timeOutput, (WIDTH/2 - timeOutput.get_width()/2 + 160, HEIGHT/2 - timeOutput.get_height()/3 + 20))

    pygame.display.update()
    pygame.time.wait(7000)
    pygame.quit()


# Function for the difficulty selector screen in the beginning
def difficultyScreen():
    root = Tk()
    root.title("Select Difficulty")
    level = 1

    def close_window(input):
        nonlocal level
        level = input
        root.destroy()

    easy_btn = Button(root, text="Easy", width=10, command=lambda: close_window(1), bg="green", fg="white")
    easy_btn.pack(side=LEFT, padx=5, pady=10)

    med_btn = Button(root, text="Medium", width=10, command=lambda: close_window(2), bg="yellow", fg="black")
    med_btn.pack(side=LEFT, padx=5, pady=10)

    hard_btn = Button(root, text="Hard", width=10, command=lambda: close_window(3), bg="red", fg="white")
    hard_btn.pack(side=LEFT, padx=5, pady=10)

    root.mainloop()
    return level


# Function to play music when the boss is not there
def playMusic():
    pygame.mixer.init()
    pygame.mixer.music.load("game_music.mp3")
    pygame.mixer.music.play(-1)


# Function to play music when the boss appears
def playBossMusic():
    pygame.mixer.init()
    pygame.mixer.music.stop()
    pygame.mixer.music.load("Boss_music.mp3")
    pygame.mixer.music.play(-1)


class Bullet(pygame.sprite.Sprite):
    """ This class represents the bullet . """

    def __init__(self, x, y, direction=1, bullet_type="normal", scatter_dir=0):
        # Call the parent class (Sprite) constructor
        super().__init__()

        # Player Bullet
        image = "normal_bullet.png"
        image_width = 10
        image_heigth = 25

        # Special Player Bullet
        if not bullet_type == "normal":
            if bullet_type == "scatter":
                image = "scatter_bullet.png"
                image_width = 15
                image_heigth = 15
            elif bullet_type == "laser":
                image = "laser_bullet.png"
                image_width = 10
                image_heigth = 50
            elif bullet_type == "asteroid":
                image = "asteroid.png"
                image_width = 40
                image_heigth = 30
                self.rightSpawnAsteroid = direction  # 1 Represents True

        # Enemy Bullet
        elif direction == -1:
            image = "enemy_bullet.png"
            image_width = 15
            image_heigth = 15

        self.image = pygame.image.load(image)
        self.image = pygame.transform.scale(self.image, (image_width, image_heigth))
        self.rect = self.image.get_rect()

        self.direction = direction
        self.rect.x = x
        self.rect.y = y
        self.bulletType = bullet_type
        self.scatterDir = scatter_dir

        if bullet_type == "asteroid": self.asteroidStarty = y

    def update(self):
        """ Move the bullet. """
        if self.bulletType == "normal": self.rect.y -= self.direction * 3
        elif self.bulletType == "multi-shot": self.rect.y -= 3
        elif self.bulletType == "laser": self.rect.y -= 2
        elif self.bulletType == "scatter":
            self.rect.y -= 3
            self.rect.x += self.scatterDir
        elif self.bulletType == "asteroid":
            x = random.randint(1,5)
            y = random.randint(1,5)
            if self.rightSpawnAsteroid:  # Appears right side - Move Left
                self.rect.x -= x
            else:  # Move right
                self.rect.x += x

            if self.asteroidStarty <= HEIGHT/2:  # Appears Top - Move down
                self.rect.y += y
            else:  # Move up
                self.rect.y -= y


class Pack(pygame.sprite.Sprite):
    """
    This class represents the 4 types of packs dropped
    by enemies.
    """

    def __init__(self, type, x, y):
        # Call the parent class (Sprite) constructor
        super().__init__()

        self.type = type
        image = ""
        if type == 0:
            image = "health_pack.png"
            self.type = "Health"
        elif type == 1:
            image = "bullet_pack.png"
            self.type = "Bullet"
        elif type == 2:
            image = "shield_pack.png"
            self.type = "Shield"
        elif type == 3:
            image = "asteroid_pack.png"
            self.type = "Asteroid"

        self.image = pygame.image.load(image)
        self.image = pygame.transform.scale(self.image, (30, 30))
        self.rect = self.image.get_rect()

        self.rect.x = x
        self.rect.y = y
        self.direction = -3

    def update(self):
        """ Drop the pack. """
        self.rect.y -= self.direction


class PlayerHealth(pygame.sprite.Sprite):
    """ This class represents the bullet . """

    def __init__(self, x):
        # Call the parent class (Sprite) constructor
        super().__init__()

        self.image = pygame.image.load("player_health.png")
        self.image = pygame.transform.scale(self.image, (20, 20))
        self.rect = self.image.get_rect()
        self.rect.y = HEIGHT - 50
        self.rect.x = x


class EnemyBossHealthBar(pygame.sprite.Sprite):
    """ This class represents the health bar for the enemy boss """

    def __init__(self, enemyBoss):
        super().__init__()

        self.width, self.height = 33 * 15, 15
        self.image = pygame.Surface([self.width, self.height])
        self.image.fill(pygame.color.THECOLORS['red'])
        self.rect = self.image.get_rect()
        self.rect.x = 222
        self.rect.y = 52.5

        self.enemyBoss = enemyBoss

    def update(self):
        # Shrink the red health bar
        self.width = self.enemyBoss.health * 15 / difficulty
        self.image = pygame.Surface([self.width, self.height])
        self.image.fill(pygame.color.THECOLORS['red'])


class Enemy(pygame.sprite.Sprite):
    """ This class represents the smaller enemies in the game. """

    def __init__(self, spawnEnemy=False):
        # Call the parent class (Sprite) constructor
        super().__init__()
        self.image = pygame.image.load("enemy_ship.png")
        self.image = pygame.transform.scale(self.image, (50, 40))
        self.rect = self.image.get_rect()

        self.rect.x = random.randrange(WIDTH)
        self.rect.y = random.randint(0, HEIGHT / 2)

        self.spawnEnemy = False
        if spawnEnemy:
            self.spawnEnemy = True
            self.destination = self.rect.y
            self.rect.y = -21

        self.movement = 3

    def update(self):
        """ Move the enemy. """
        if self.spawnEnemy:
            self.rect.y += 3
            if self.rect.y >= self.destination: self.spawnEnemy = False

        if not self.spawnEnemy:
            if self.rect.x >= WIDTH or self.rect.x <= 0:
                self.rect.y += self.rect.height
                self.movement *= -1
            self.rect.x += self.movement


class EnemyBoss(pygame.sprite.Sprite):
    """ This class represents the enemy boss. """

    def __init__(self, player):
        # Call the parent class (Sprite) constructor
        super().__init__()
        self.image = pygame.image.load("boss_ship.png")
        self.image = pygame.transform.scale(self.image, (350, 300))
        self.rect = self.image.get_rect()

        self.rect.x = WIDTH/2 - 175
        self.rect.y = -300
        self.rect.height = 200
        self.rect.width = 350

        self.movement = 3
        self.player = player
        self.health = 33 * difficulty
        self.status = "Inactive"

    def update(self):
        """ Move the enemy boss. """
        if self.status == "Descend": self.rect.y += 3
        elif self.status == "Active":
            # seeking the player
            distance = abs(self.player.rect.x - self.rect.x - 135)

            # Only move if the player is far enough away
            if distance >= 3:
                if self.player.rect.x - 135 > self.rect.x: self.rect.x += self.movement
                elif self.player.rect.x - 135 < self.rect.x: self.rect.x -= self.movement


class Game:
    """ This class represents the Game. It contains all the game objects. """

    def __init__(self):
        """ Set up the game on creation. """

        # Initialize Pygame
        self.won = False
        pygame.init()
        # --- Create the window
        # Set the height and width of the screen
        self.screen_width = WIDTH
        self.screen_height = HEIGHT
        self.screen = screen
        self.boss_here = False
        self.music_playing = False

        background_image = pygame.image.load("galaxy_background.jpg")
        self.background_image = pygame.transform.scale(background_image, (WIDTH, HEIGHT))

        self.numEnemiesStart = 33
        self.quit = False
        self.shoot_chance = 1
        self.score = 0
        self.totalEnimies = 50 * difficulty
        global start_time
        start_time = time.time()
        self.player = Player()  # Create the player's ship
        self.enemyBoss = EnemyBoss(self.player)

        # --- Sprite lists

        # This is a list of every sprite
        self.all_sprites_list = pygame.sprite.Group()

        # List of each enemy in the game
        self.enemy_list = pygame.sprite.Group()

        # List of each bullet
        self.bullet_list = pygame.sprite.Group()

        # List of each enemy bullet
        self.enemy_bullet_list = pygame.sprite.Group()

        # List of every pack
        self.pack_list = pygame.sprite.Group()

        # List of player health hearts
        self.player_health_list = pygame.sprite.Group()

        # --- Create the sprites
        self.totalEnimies -= self.numEnemiesStart
        for i in range(self.numEnemiesStart):
            # Place the enemy
            enemyBlock = Enemy()

            # Add the block to the list of objects
            self.enemy_list.add(enemyBlock)
            self.all_sprites_list.add(enemyBlock)

        self.all_sprites_list.add(self.player)
        self.all_sprites_list.add(self.enemyBoss)

    def poll(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.quit = True

            elif event.type == pygame.MOUSEBUTTONDOWN:
                # Fire a bullet if the user clicks the mouse button
                bullet = Bullet(self.player.rect.x + 35, self.player.rect.y - 20)
                # Add the bullet to the lists
                self.all_sprites_list.add(bullet)
                self.bullet_list.add(bullet)

    def update(self) -> bool:
        # Continue game
        continueGame = True

        # Shoot enemy bullet
        for enemy in self.enemy_list:
            if random.randint(1,1000) <= self.shoot_chance:
                x = (enemy.rect.x + enemy.rect.width / 2) - 8
                y = (enemy.rect.y + enemy.rect.height) - 13
                bullet = Bullet(x, y, -1)
                self.enemy_bullet_list.add(bullet)
                self.all_sprites_list.add(bullet)

        # Activate boss and shoot his bullets
        if len(self.enemy_list) == 0:
            if self.enemyBoss.status != "Active":
                self.enemyBoss.status = "Descend"
                self.boss_here = True
                self.music_playing = False
                if self.enemyBoss.rect.y >= 75:
                    self.enemyBoss.status = "Active"
                    self.all_sprites_list.add(EnemyBossHealthBar(self.enemyBoss))
            if self.enemyBoss.status == "Active":
                for i, coordinate in enumerate(bossBulletCoordinates, start=1):
                    x = self.enemyBoss.rect.x + coordinate[0]
                    y = self.enemyBoss.rect.y + coordinate[1]
                    bullet = Bullet(x, y, -1)
                    firingChance = random.randint(0, 5000)

                    if i == 4 and firingChance <= 75:  # Middle/Main Cannon - 1.5% firing chance
                        self.all_sprites_list.add(bullet)
                        self.enemy_bullet_list.add(bullet)
                    elif (i == 3 or i == 5) and firingChance <= 50:  # Inner Cannons - 1% firing chance
                        self.all_sprites_list.add(bullet)
                        self.enemy_bullet_list.add(bullet)
                    elif (i == 2 or i == 6) and firingChance <= 25:  # Secondary Cannons - 0.5% firing chance
                        self.all_sprites_list.add(bullet)
                        self.enemy_bullet_list.add(bullet)
                    elif (i == 1 or i == 7) and firingChance <= 12:  # Outer Cannons - 0.24% firing chance
                        self.all_sprites_list.add(bullet)
                        self.enemy_bullet_list.add(bullet)

        # Shoot special bullets
        if not self.player.bulletType == ["normal"]:
            for i in range(1, len(self.player.bulletType)):
                bullet = self.player.bulletType[i]
                if bullet == "multi-shot":
                    for coordinate in multiBulletCoordinates:
                        x = self.player.rect.x + coordinate[0]
                        y = self.player.rect.y + coordinate[1]
                        bullet = Bullet(x, y, 1, "normal")
                        self.all_sprites_list.add(bullet)
                        self.bullet_list.add(bullet)

                elif bullet == "scatter":
                    for coordinate in scatterBulletCoordinates:
                        for i in range(-1,2):
                            x = self.player.rect.x + coordinate[0]
                            y = self.player.rect.y + coordinate[1]
                            bullet = Bullet(x, y, 1, "scatter", i)
                            self.all_sprites_list.add(bullet)
                            self.bullet_list.add(bullet)

                elif bullet == "laser":
                    x = self.player.rect.x + 35
                    y = self.player.rect.y - 20
                    bullet = Bullet(x, y, 1, "laser")
                    self.bullet_list.add(bullet)
                    self.all_sprites_list.add(bullet)

                elif bullet == "asteroid":
                    rightAsteroid = random.randint(0, 1)
                    x = -20
                    y = random.randint(40, HEIGHT - 40)
                    if rightAsteroid: x = WIDTH + 20
                    bullet = Bullet(x, y, rightAsteroid, "asteroid")
                    self.bullet_list.add(bullet)
                    self.enemy_bullet_list.add(bullet)
                    self.all_sprites_list.add(bullet)

            self.player.bulletType = ["normal"]

        # Call the update() method on all the sprites
        self.all_sprites_list.update()

        # Calculate mechanics for player bullets
        for bullet in self.bullet_list:
            # Remove enemies hit by bullet
            enemy_hit_list = pygame.sprite.spritecollide(bullet, self.enemy_list, True)

            # If enemy hit, remove the bullet and add to the score
            if len(enemy_hit_list) > 0:
                self.score += len(enemy_hit_list)
                print(self.score)
                if not (bullet.bulletType == "laser" or bullet.bulletType == "asteroid"):
                    self.bullet_list.remove(bullet)
                    self.all_sprites_list.remove(bullet)

            deadEnimies = len(enemy_hit_list)
            while deadEnimies > 0 and self.totalEnimies > 0:
                enemy = Enemy(spawnEnemy=True)
                self.enemy_list.add(enemy)
                self.all_sprites_list.add(enemy)
                self.totalEnimies -= 1
                deadEnimies -= 1

            for enemy in enemy_hit_list:
                packChance = random.randint(0, 30)
                if packChance <= 3:
                    pack = Pack(packChance, enemy.rect.x, enemy.rect.y)
                    self.pack_list.add(pack)
                    self.all_sprites_list.add(pack)

            # Remove the bullet if it flies up off the screen
            if bullet.rect.y < (0 - bullet.rect.height):
                self.bullet_list.remove(bullet)
                self.all_sprites_list.remove(bullet)

        # If enemy ship collides with player ship
        block_hit_list = pygame.sprite.spritecollide(self.player, self.enemy_list, False)
        for block in block_hit_list:
            self.enemy_list.remove(block)
            self.all_sprites_list.remove(block)
        if not self.player.shield: self.player.lives -= len(block_hit_list)

        boss_hit_list = pygame.sprite.spritecollide(self.enemyBoss, self.bullet_list, True)
        if self.enemyBoss.status == "Active":
            for bullet in boss_hit_list:
                self.all_sprites_list.remove(bullet)
                packChance = random.randint(0, 30)
                if packChance <= 3:
                    pack = Pack(packChance, bullet.rect.x, bullet.rect.y + 50)
                    self.pack_list.add(pack)
                    self.all_sprites_list.add(pack)
            self.enemyBoss.health -= len(boss_hit_list)

        # Remove all collected packs
        block_hit_list = pygame.sprite.spritecollide(self.player, self.pack_list, True)

        # For each pack collected, remove the pack and enhance the player
        for pack in block_hit_list:
            self.all_sprites_list.remove(pack)
            self.player.activeBuffs.append(pack.type)

        # Remove the pack if it flies up off the screen
        for pack in self.pack_list:
            if pack.rect.y > (HEIGHT + pack.rect.height):
                self.pack_list.remove(pack)
                self.all_sprites_list.remove(pack)

        # Remove the enemy bullet if it flies up off the screen
        for bullet in self.enemy_bullet_list:
            if bullet.rect.y > (HEIGHT + bullet.rect.height):
                self.enemy_bullet_list.remove(bullet)
                self.all_sprites_list.remove(bullet)

        # Determine game success or failure
        collided_bullets = pygame.sprite.spritecollide(self.player, self.enemy_bullet_list, True)
        if not self.player.shield: self.player.lives -= len(collided_bullets)
        for bullet in collided_bullets: self.all_sprites_list.remove(bullet)

        if self.player.lives <= 0:
            self.player.lives = 0
            continueGame = False
        self.player_health_list.empty()
        for i in range(self.player.lives): self.player_health_list.add(PlayerHealth(100 + (50*i)))

        if len(self.enemy_list) == 0 and self.enemyBoss.health <= 0:
            self.enemyBoss.status = "Dead"
            self.enemyBoss.health = 0
            self.won = True
            continueGame = False

        # Remove all sprites from the screen except the player and his health sprites
        if not continueGame:
            new_list = pygame.sprite.Group()
            for sprite in self.all_sprites_list:
                if sprite == self.player or sprite in self.player_health_list:
                    new_list.add(sprite)
            self.all_sprites_list = new_list

        return continueGame

    def draw(self):
        # Clear the screen
        # self.screen.fill(pygame.color.THECOLORS['white'])
        self.screen.blit(self.background_image, (0, 0))

        # Draw all the sprites
        self.all_sprites_list.draw(self.screen)
        self.player_health_list.draw(self.screen)

        # Draw Shield
        if self.player.shield:
            x = self.player.rect.x
            y = self.player.rect.y
            pygame.draw.circle(self.screen, (135,206,235), (x + 40, y + 47), 60, 5)

        font = pygame.font.Font(None, 30)
        elapsed_time = time.time() - start_time
        min, sec = divmod(elapsed_time, 60)
        timeText = font.render("Time | " + str(int(min)) + ":" + str(int(sec)), True, (0, 255, 255))
        livesText = font.render("Lives | ", True, (255,70,70))
        enemyLivesText = font.render("Imperial Destroyer | ", True, (255,70,70))

        screen.blit(livesText, (20, HEIGHT - 50))
        screen.blit(timeText, (20, HEIGHT - 80))
        if self.enemyBoss.status == "Active": screen.blit(enemyLivesText, (20, 50))

    def run(self):
        # Used to manage how fast the screen updates
        clock = pygame.time.Clock()

        # -------- Main Program Loop -----------
        while True:
            if self.boss_here and not self.music_playing:
                playBossMusic()
                self.music_playing = True
            elif not self.boss_here and not self.music_playing:
                playMusic()
                self.music_playing = True
            self.poll()  # Event processing
            resume = self.update()  # Handle game logic
            self.draw()  # Draw a frame
            pygame.display.flip()  # Update the screen with what we've drawn.
            clock.tick(60)  # Limit the frames per second

            if self.quit: pygame.quit()
            if not resume: break

        bossScore = (33 * difficulty) - self.enemyBoss.health
        self.score += (self.player.lives * 5) + bossScore
        gameOver(self.won, self.score)


if __name__ == '__main__':
    # difficulty = difficultyScreen()
    g = Game()
    g.run()

