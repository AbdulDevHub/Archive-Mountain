"""
Title: Space Invaders
Description: Interactive and Enhanced Game of Space Invaders
Authors: Abdul Khan & Uzair
Last Modified: Feb 24, 2023
"""
import pygame
import random

WIDTH = 640
HEIGHT = 480
screen = pygame.display.set_mode([WIDTH, HEIGHT])

# --- Game Classes


class Player(pygame.sprite.Sprite):
    """ This class represents the Player. """

    def __init__(self):
        """ Set up the player on creation. """
        # Call the parent class (Sprite) constructor
        super().__init__()

        self.image = pygame.Surface([20, 20])
        self.image.fill(pygame.color.THECOLORS['red'])

        self.rect = self.image.get_rect()

    def update(self):
        """ Update the player's position. """
        # Get the current mouse position. This returns the position
        # as a list of two numbers.
        pos = pygame.mouse.get_pos()

        # Set the player x position to the mouse x position
        self.rect.x = pos[0]


def game_over():
    screen.fill((0, 0, 0))
    font = pygame.font.SysFont('arial', 40)
    title = font.render('You Lose', True, (255, 255, 255))
    screen.blit(title, (WIDTH/2 - title.get_width()/2, HEIGHT/2 - title.get_height()/3))
    pygame.display.update()
    pygame.time.wait(2000)
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


class Asteroid(pygame.sprite.Sprite):
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


class HealthPack(pygame.sprite.Sprite):
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


class BulletPack(pygame.sprite.Sprite):
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


class SheildPack(pygame.sprite.Sprite):
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


class AsteroidPack(pygame.sprite.Sprite):
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


class PlayerHealth(pygame.sprite.Sprite):
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
        self.image = pygame.image.load("ship.png")
        self.image = pygame.transform.scale(self.image, (30, 30))
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
        self.image = pygame.image.load("ship.png")
        self.image = pygame.transform.scale(self.image, (30, 30))
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
        pygame.init()
        # --- Create the window
        # Set the height and width of the screen
        self.screen_width = WIDTH
        self.screen_height = HEIGHT
        self.screen = screen

        self.num_blocks = 50
        self.running = False
        self.shoot_chance = 5

        # --- Sprite lists

        # This is a list of every sprite. All blocks and the player block as well.
        self.all_sprites_list = pygame.sprite.Group()

        # List of each enemy in the game
        self.enemy_list = pygame.sprite.Group()

        # List of each bullet
        self.bullet_list = pygame.sprite.Group()

        # List of each enemy bullet
        self.enemy_bullet_list = pygame.sprite.Group()

        # --- Create the sprites

        for i in range(self.num_blocks):
            # This represents a block
            enemyBlock = Enemy(pygame.color.THECOLORS['blue'],
                               (self.screen_width, self.screen_height))

            # Set a random location for the block
            enemyBlock.rect.x = random.randrange(self.screen_width)
            enemyBlock.rect.y = random.randrange(
                self.screen_height / 2)  # don't go all the way down

            # Add the block to the list of objects
            self.enemy_list.add(enemyBlock)
            self.all_sprites_list.add(enemyBlock)

        # Create a red player block
        self.player = Player()
        self.all_sprites_list.add(self.player)

        self.score = 0
        # this number is fairly arbitrary - just move the player off the bottom of the screen a bit based on the height of the player
        self.player.rect.y = self.screen_height - self.player.rect.height * 2

        font = pygame.font.Font(None, 30)
        text = font.render("Lives: " + str(player.lives), True, (255, 255, 255))
        screen.blit(text, (screen.get_width() - 150, 30))

    def poll(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False

            elif event.type == pygame.MOUSEBUTTONDOWN:
                # Fire a bullet if the user clicks the mouse button
                bullet = Bullet()
                # Set the bullet so it is where the player is
                bullet.rect.x = self.player.rect.x
                bullet.rect.y = self.player.rect.y
                # Add the bullet to the lists
                self.all_sprites_list.add(bullet)
                self.bullet_list.add(bullet)

    def update(self) -> bool:
        # Continue game
        continueGame = True

        # Shoot enemy bullet
        for enemy in self.enemy_list:
            if random.randint(1,1000) <= self.shoot_chance:
                bullet = Bullet(-1)
                bullet.rect.x = enemy.rect.x + enemy.rect.width / 2
                bullet.rect.y = enemy.rect.y + enemy.rect.height
                self.enemy_bullet_list.add(bullet)
                self.all_sprites_list.add(bullet)

        # Call the update() method on all the sprites
        self.all_sprites_list.update()

        # Calculate mechanics for each bullet
        for bullet in self.bullet_list:
            # See if it hit a block
            block_hit_list = pygame.sprite.spritecollide(
                bullet, self.enemy_list, True)

            # For each block hit, remove the bullet and add to the score
            for block in block_hit_list:
                self.bullet_list.remove(bullet)
                self.all_sprites_list.remove(bullet)
                self.score += 1
                print(self.score)

            # Remove the bullet if it flies up off the screen
            if bullet.rect.y < (0 - bullet.rect.height):
                self.bullet_list.remove(bullet)
                self.all_sprites_list.remove(bullet)

        # Calculate mechanics for enemy bullet
        collided_bullets = pygame.sprite.spritecollide(self.player, self.enemy_bullet_list, True)
        if len(collided_bullets) > 0:
            print("You Lose!!!")
            continueGame = False

        # If enemy hits bottom, reduce score and/or fail player
        for enemy in self.enemy_list:
            if enemy.rect.y > self.screen_height:
                self.score -= 1
            if self.score < 0:
                print("You Lose!!!")
                continueGame = False
                break
        if 0 == len(self.enemy_list):
            print(f"You Win!!! Your score is {self.score}!")
            continueGame = False

        return continueGame

    def draw(self):
        # Clear the screen
        self.screen.fill(pygame.color.THECOLORS['white'])

        # Draw all the spites
        self.all_sprites_list.draw(self.screen)

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


if __name__ == '__main__':
    g = Game()
    print("starting...")
    g.run()
    print("shuting down...")
    pygame.quit()
