"""
Title: Space Invaders
Description: Interactive and Enhanced Game of Space Invaders
Authors: Abdul Khan & Uzair
Last Modified: Feb 24, 2023
"""
import pygame
import random

WIDTH = 840
HEIGHT = 680
screen = pygame.display.set_mode([WIDTH, HEIGHT])
specialBulletCoordinates = ((35,-20),(35,-20),(35,-20),(35,-20))

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

        self.bulletType = "normal"
        self.shield = False
        self.asteroid = 0
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
            self.bulletType = random.randint(0,2)
            if self.bulletType == 0: self.bulletType = "multi-shot"
            elif self.bulletType == 1: self.bulletType = "scatter"
            else: self.bulletType = "laser"
        if "Shield" in self.activeBuffs: self.shield = True
        self.asteroid = self.activeBuffs.count("Asteroid")
        self.activeBuffs = []


def gameOver(won):
    font = pygame.font.SysFont('arial', 40)
    endPhrase = "You Lost!"
    color = (255,0,0)
    if won:
        endPhrase = "You Won!"
        color = (124,252,0)

    title = font.render("GAME OVER", True, (0, 0, 0))
    endStatus = font.render(endPhrase, True, color)
    screen.blit(title, (WIDTH/2 - title.get_width()/2, HEIGHT/2 - title.get_height()/3 - 20))
    screen.blit(endStatus, (WIDTH/2 - endStatus.get_width()/2, HEIGHT/2 - endStatus.get_height()/3 + 20))

    pygame.display.update()
    pygame.time.wait(2000)
    pygame.quit()


def playerHealth(lives, spriteList):
    font = pygame.font.Font(None, 30)
    text = font.render("Lives | " + str(lives), True, (255, 0, 0))
    screen.blit(text, (10, HEIGHT - 50))
    spriteList.empty()
    for i in range(lives): spriteList.add(PlayerHealth(100 + (50*i)))


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
                image_width = 30
                image_heigth = 40

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
        elif self.bulletType == "laser": self.rect.y -= 1
        elif self.bulletType == "scatter":
            self.rect.y -= 3
            self.rect.x += self.scatterDir


class Sheild(pygame.sprite.Sprite):
    """ This class represents the bullet . """

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


class Asteroid(Bullet):
    """ This class represents the bullet . """

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
        self.rect.x


class Timer(pygame.sprite.Sprite):
    """ This class represents the bullet . """

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


class EnemeyBossHealthBar(pygame.sprite.Sprite):
    """ This class represents the bullet . """

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


class SpecialPlayerBullets(pygame.sprite.Sprite):
    """ 3 bullet attack, triangle bullets attack, laser bullet attack"""

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

    def __init__(self, color, screenMeasurment):
        # Call the parent class (Sprite) constructor
        super().__init__()
        self.image = pygame.image.load("boss_ship.png")
        self.image = pygame.transform.scale(self.image, (120, 120))
        self.rect = self.image.get_rect()
        self.movement = 3
        self.screenMeasurment = screenMeasurment

    def update(self):
        """ Move the enemy bosss. """
        if self.rect.x >= self.screenMeasurment[0] or self.rect.x <= 0:
            self.movement *= -1
        self.rect.x += self.movement


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

        self.num_blocks = 50
        self.running = False
        self.quit = False
        self.shoot_chance = 1

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
        self.player_health__list = pygame.sprite.Group()

        # --- Create the sprites

        for i in range(self.num_blocks):
            # This represents a block
            enemyBlock = Enemy(pygame.color.THECOLORS['blue'],
                               (self.screen_width, self.screen_height))

            # Set a random location for the block
            enemyBlock.rect.x = random.randrange(self.screen_width)
            enemyBlock.rect.y = random.randint(0, HEIGHT / 2)

            # Add the block to the list of objects
            self.enemy_list.add(enemyBlock)
            self.all_sprites_list.add(enemyBlock)

        # Create the player's ship
        self.player = Player()
        self.all_sprites_list.add(self.player)

        self.score = 0
        # this number is fairly arbitrary - just move the player off the bottom
        # of the screen a bit based on the height of the player
        self.player.rect.y = self.screen_height - self.player.rect.height * 2

    def poll(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
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

        # Shoot special bullets
        if not self.player.bulletType == "normal":
            bullet = None
            if self.player.bulletType == "multi-shot":
                for coordinate in specialBulletCoordinates:
                    x = self.player.rect.x + coordinate[0]
                    y = self.player.rect.y + coordinate[1]
                    bullet = Bullet(x, y, 1, "scatter")
                    self.bullet_list.add(bullet)
                    self.all_sprites_list.add(bullet)

            elif self.player.bulletType == "scatter":
                for coordinate in specialBulletCoordinates:
                    x = self.player.rect.x + coordinate[0]
                    y = self.player.rect.y + coordinate[1]
                    bullet = Bullet(x, y, 1, "scatter")
                    self.bullet_list.add(bullet)
                    self.all_sprites_list.add(bullet)

            elif self.player.bulletType == "laser":
                x = self.player.rect.x + 35
                y = self.player.rect.y - 20
                bullet = Bullet(x, y, 1, "laser")
                self.bullet_list.add(bullet)
                self.all_sprites_list.add(bullet)

            self.player.bulletType = "normal"


        # Call the update() method on all the sprites
        self.all_sprites_list.update()

        # Calculate mechanics for each bullet
        for bullet in self.bullet_list:
            # See if it hit a block
            block_hit_list = pygame.sprite.spritecollide(bullet, self.enemy_list, True)

            # For each block hit, remove the bullet and add to the score
            for block in block_hit_list:
                self.bullet_list.remove(bullet)
                self.all_sprites_list.remove(bullet)
                self.score += 1
                print(self.score)

                packChance = random.randint(0, 30)
                if packChance <= 3:
                    pack = Pack(packChance, block.rect.x, block.rect.y)
                    self.pack_list.add(pack)
                    self.all_sprites_list.add(pack)

            # Remove the bullet if it flies up off the screen
            if bullet.rect.y < (0 - bullet.rect.height):
                self.bullet_list.remove(bullet)
                self.all_sprites_list.remove(bullet)

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

        # Determine game sucess or failure
        collided_bullets = pygame.sprite.spritecollide(self.player, self.enemy_bullet_list, True)
        if len(collided_bullets) > 0: self.player.lives -= 1

        # If enemy hits bottom, reduce life and score
        for enemy in self.enemy_list:
            if enemy.rect.y > self.screen_height:
                self.player.lives -= 1
                print(collided_bullets, collided_bullets[0].rect.y)

        playerHealth(self.player.lives, self.player_health__list)
        if self.player.lives <= 0: continueGame = False

        if 0 == len(self.enemy_list):
            print(f"You Win!!! Your score is {self.score}!")
            self.won = True
            continueGame = False

        return continueGame

    def draw(self):
        # Clear the screen
        self.screen.fill(pygame.color.THECOLORS['white'])

        # Draw all the spites
        self.all_sprites_list.draw(self.screen)
        self.player_health__list.draw(self.screen)

    def run(self):
        self.running = True
        # Used to manage how fast the screen updates
        clock = pygame.time.Clock()

        # -------- Main Program Loop -----------
        while self.running:
            # --- Event processing
            self.poll()

            # --- Handle game logic
            if not self.update(): break

            # --- Draw a frame
            self.draw()

            # Update the screen with what we've drawn.
            pygame.display.flip()

            # --- Limit the frames per second
            clock.tick(60)

        if quit: pygame.quit()
        else: gameOver(self.won)


if __name__ == '__main__':
    g = Game()
    g.run()
