"""
Title: Space Invaders
Description: Interactive and Enhanced Game of Space Invaders
Authors: Abdul Khan & Uzair
Last Modified: Feb 24, 2023
"""

import pygame
import random
import time
import os

WIDTH = 840
HEIGHT = 680
screen = pygame.display.set_mode([WIDTH, HEIGHT])
scatterBulletCoordinates = ((-2, 20), (13, 10), (50, 10), (65, 20))
multiBulletCoordinates = ((2, 17), (16, 8), (54, 8), (68, 17))
start_time = None
shield_start_time = None
multi_shot_start_time = None
background_image = pygame.image.load("galaxy.jpg")
background_image = pygame.transform.scale(background_image, (840, 680))


# code to play background music
pygame.mixer.init()
theme_song = "Wallpaper.mp3"
# Play the music infinitely
pygame.mixer.music.load(theme_song)
pygame.mixer.music.play(-1)


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


def gameOver(won, score):
    title_font = pygame.font.SysFont('arial', 80)
    endPhrase_font = pygame.font.SysFont('arial', 60)
    scoreTime_font = pygame.font.SysFont('arial', 40)

    endPhrase = "You Lost!"
    color = (255,0,0)
    if won:
        endPhrase = "You Won!"
        color = (124,252,0)

    title = title_font.render("GAME OVER", True, (0, 0, 255))
    endStatus = endPhrase_font.render(endPhrase, True, color)
    scoreOutput = scoreTime_font.render("Your Score | " + str(score), True, (0, 0, 0))

    elapsed_time = time.time() - start_time
    min, sec = divmod(elapsed_time, 60)
    timeOutput = scoreTime_font.render("Your Time | " + str(int(min)) + ":" + str(int(sec)), True, (0, 0, 0))

    screen.blit(title, (WIDTH/2 - title.get_width()/2, HEIGHT/2 - title.get_height()/3 - 160))
    screen.blit(endStatus, (WIDTH/2 - endStatus.get_width()/2, HEIGHT/2 - endStatus.get_height()/3 - 70))
    screen.blit(scoreOutput, (WIDTH/2 - scoreOutput.get_width()/2 - 140, HEIGHT/2 - scoreOutput.get_height()/3 + 20))
    screen.blit(timeOutput, (WIDTH/2 - timeOutput.get_width()/2 + 160, HEIGHT/2 - timeOutput.get_height()/3 + 20))

    pygame.display.update()
    pygame.time.wait(7000)
    pygame.quit()


def difficultyScreen():
    screen.fill((0, 0, 0))
    font = pygame.font.SysFont('arial', 40)
    title = font.render('You Lose', True, (255, 255, 255))
    screen.blit(title, (WIDTH/2 - title.get_width()/2, HEIGHT/2 - title.get_height()/3))
    pygame.display.update()
    pygame.time.wait(2000)
    pygame.quit()


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
                image_width = 15
                image_heigth = 40
            elif bullet_type == "asteroid":
                image = "asteroid.png"
                image_width = 40
                image_heigth = 30
                self.rightAsteroid = direction  # 1 Represents True

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

    def update(self):
        """ Move the bullet. """
        if self.bulletType == "normal": self.rect.y -= self.direction * 3
        elif self.bulletType == "multi-shot": self.rect.y -= 3
        elif self.bulletType == "laser": self.rect.y -= 2
        elif self.bulletType == "scatter":
            self.rect.y -= 3
            self.rect.x += self.scatterDir
        elif self.bulletType == "asteroid":
            if self.rightAsteroid and self.rect.y <= HEIGHT/2:  # Top Right
                self.rect.y -= random.randint(1,5)
                self.rect.x -= random.randint(1,5)
            elif self.rightAsteroid and self.rect.y > HEIGHT/2:  # Bottom Right
                self.rect.y += random.randint(1,5)
                self.rect.x -= random.randint(1,5)
            elif (not self.rightAsteroid) and self.rect.y <= HEIGHT/2:  # Top Left
                self.rect.y += random.randint(1,5)
                self.rect.x += random.randint(1,5)
            else:  # Bottom Left
                self.rect.y -= random.randint(1,5)
                self.rect.x += random.randint(1,5)


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


class BossHealth(pygame.sprite.Sprite):
    """ This class represents the bullet . """

    def __init__(self, x):
        # Call the parent class (Sprite) constructor
        super().__init__()
        self.image = pygame.image.load("player_health.png")
        self.image = pygame.transform.scale(self.image, (20, 20))
        self.rect = self.image.get_rect()
        self.rect.y = 50
        self.rect.x = x


class SpecialEnemyBossBullets(pygame.sprite.Sprite):
    """ enemy boss bullets x4 """

    def __init__(self, direction = 1):
        # Call the parent class (Sprite) constructor
        super().__init__()

        self.image = pygame.Surface([4, 10])

        self.image.fill(pygame.color.THECOLORS['black'])

        self.rect = self.image.get_rect()
        self.direction = direction

    def update(self):
        """ Move the bullet. """
        self.rect.y -= self.direction * 3


class Enemy(pygame.sprite.Sprite):
    """ This class represents the enemy. """

    def __init__(self, color, screenMeasurment):
        # Call the parent class (Sprite) constructor
        super().__init__()
        self.image = pygame.image.load("enemy_ship.png")
        self.image = pygame.transform.scale(self.image, (50, 40))
        self.rect = self.image.get_rect()
        self.movement = 3
        self.screenMeasurment = screenMeasurment

    def update(self):
        """ Move the enemy. """
        if self.rect.x >= self.screenMeasurment[0] or self.rect.x <= 0:
            self.rect.y += self.rect.height
            self.movement *= -1
        self.rect.x += self.movement


class EnemyBoss(pygame.sprite.Sprite):
    """ This class represents the enemy boss. """

    def __init__(self, screenMeasurment):
        # Call the parent class (Sprite) constructor
        super().__init__()
        self.image = pygame.image.load("boss_ship.png")
        self.image = pygame.transform.scale(self.image, (120, 120))
        self.rect = self.image.get_rect()
        self.movement = 3
        self.vertical_movement = 1
        self.screenMeasurment = screenMeasurment
        self.health = 5

    def update(self, player):
        """ Move the enemy bosss. """
        # seeking the player
        if player.rect.x > self.rect.x:
            self.rect.x += self.movement
        elif player.rect.x < self.rect.x:
            self.rect.x -= self.movement


class Game:
    """ This class represents the Game. It contains all the game objects. """

    def __init__(self):
        """ Set up the game on creation. """

        # Initialize Pygame
        self.won = False
        pygame.init()
        pygame.mixer.init()
        # --- Create the window
        # Set the height and width of the screen
        self.screen_width = WIDTH
        self.screen_height = HEIGHT
        self.screen = screen

        self.bring_boss = False
        self.num_blocks = 1
        self.quit = False
        self.shoot_chance = 1
        self.score = 0
        global start_time
        start_time = time.time()

        # Create the player's ship
        self.player = Player()
        self.player.rect.y = self.screen_height - self.player.rect.height * 2

        # Create the final boss
        self.enemy_boss = EnemyBoss((self.screen_width, self.screen_height))
        self.enemy_boss.rect.x = self.screen_width / 2
        self.enemy_boss.rect.y = 50

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

        # List of enemy boss health hearts
        self.enemy_boss_health_list = pygame.sprite.Group()

        # List for the player
        self.player_list = pygame.sprite.Group()

        # List for the final enemy boss
        self.final_boss_list = pygame.sprite.Group()
        self.final_boss_list.add(self.enemy_boss)

        # --- Create the sprites

        for i in range(self.num_blocks):
            # This represents a block
            enemyBlock = Enemy(pygame.color.THECOLORS['blue'],
                               (self.screen_width, self.screen_height))

            # Set a random location for the block
            enemyBlock.rect.x = random.randrange(self.screen_width)
            enemyBlock.rect.y = random.randint(0, int(HEIGHT / 2))

            # Add the block to the list of objects
            self.enemy_list.add(enemyBlock)
            self.all_sprites_list.add(enemyBlock)

        self.all_sprites_list.add(self.player)
        self.player_list.add(self.player)

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

        # Shoot final boss bullet
        for boss in self.final_boss_list:
            if self.bring_boss and random.randint(1, 2) == self.shoot_chance:
                x = (boss.rect.x + boss.rect.width / 2) - 8
                y = (boss.rect.y + boss.rect.height) - 13
                bullet = Bullet(x, y, -1)
                self.enemy_bullet_list.add(bullet)
                self.all_sprites_list.add(bullet)

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
                    y = random.randint(10, HEIGHT - 10)
                    if rightAsteroid: x = WIDTH + 20
                    bullet = Bullet(x, y, rightAsteroid, "asteroid")
                    self.bullet_list.add(bullet)
                    self.enemy_bullet_list.add(bullet)
                    self.all_sprites_list.add(bullet)

            self.player.bulletType = ["normal"]

        # Call the update() method on all the sprites
        self.all_sprites_list.update()
        self.final_boss_list.update(self.player)

        # Calculate mechanics for each bullet
        for bullet in self.bullet_list:
            # See if it hit a block
            block_hit_list = pygame.sprite.spritecollide(bullet, self.enemy_list, True)

            # If block hit, remove the bullet and add to the score
            if len(block_hit_list) > 0 and not (bullet.bulletType == "laser" or bullet.bulletType == "asteroid"):
                self.bullet_list.remove(bullet)
                self.all_sprites_list.remove(bullet)
                self.score += 1

            for block in block_hit_list:
                packChance = random.randint(0, 30)
                if packChance <= 3:
                    pack = Pack(packChance, block.rect.x, block.rect.y)
                    self.pack_list.add(pack)
                    self.all_sprites_list.add(pack)

            # Remove the bullet if it flies up off the screen
            if bullet.rect.y < (0 - bullet.rect.height):
                self.bullet_list.remove(bullet)
                self.all_sprites_list.remove(bullet)

        block_hit_list = pygame.sprite.spritecollide(self.player, self.enemy_list, False)
        for block in block_hit_list:
            self.enemy_list.remove(block)
            self.all_sprites_list.remove(block)
        if not self.player.shield: self.player.lives -= len(block_hit_list)

        boss_hit_list = pygame.sprite.spritecollide(self.enemy_boss, self.player_list, False)
        for attack in boss_hit_list:
            self.enemy_boss.health -= len(boss_hit_list)
            if self.enemy_boss.health <= 0:
                self.final_boss_list.remove(attack)

        # Calculate mechanics for each pack
        block_hit_list = pygame.sprite.spritecollide(self.player, self.pack_list, True)

        # For each pack collected, remove the pack and enhance the player
        for pack in block_hit_list:
            self.pack_list.remove(pack)
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

        if self.player.lives <= 0: continueGame = False
        self.player_health_list.empty()
        for i in range(self.player.lives): self.player_health_list.add(PlayerHealth(100 + (50*i)))
        for i in range(self.enemy_boss.health):
            self.enemy_boss_health_list.add(BossHealth(100 + (50*i)))

        if len(self.enemy_list) == 0:
            self.bring_boss = True

        if 0 == len(self.final_boss_list):
            self.won = True
            continueGame = False

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
        self.screen.blit(background_image, (0, 0))

        # Draw all the spites
        self.all_sprites_list.draw(self.screen)
        self.player_health_list.draw(self.screen)
        if self.bring_boss:
            self.final_boss_list.draw(self.screen)
            self.enemy_boss_health_list.draw(self.screen)

        # Draw Shield
        if self.player.shield:
            x = self.player.rect.x
            y = self.player.rect.y
            pygame.draw.circle(self.screen, (135,206,235), (x + 40, y + 47), 60, 5)

        font = pygame.font.Font(None, 30)
        elapsed_time = time.time() - start_time
        min, sec = divmod(elapsed_time, 60)
        timeText = font.render("Time | " + str(int(min)) + ":" + str(int(sec)), True, (0, 0, 255))
        livesText = font.render("Lives | ", True, (255, 0, 0))
        enemylivesText = font.render("Lives | ", True, (255, 0, 0))
        if self.bring_boss:
            screen.blit(enemylivesText, (20, 50))
        screen.blit(livesText, (20, HEIGHT - 50))
        screen.blit(timeText, (20, HEIGHT - 80))

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

            if self.quit: pygame.quit()
            if not resume: break

        gameOver(self.won, self.score + (self.player.lives * 5))


if __name__ == '__main__':
    g = Game()
    g.run()
