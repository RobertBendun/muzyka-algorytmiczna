from pythonosc import osc_server
from pythonosc.dispatcher import Dispatcher
import pygame
import threading
import random
import logging
import os

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

array = [random.randint(0, 128) for _ in range(128)]

less_i, less_j = None, None
swap_i, swap_j = None, None
set_i = None
change_name = None

def on_reset(address, length):
    global array
    log.debug(f"Reset({length})")
    array = [None] * length
    set_i, less_i, less_j, swap_i, swap_j, change_name = None, None, None, None, None, None

def on_set(address, i, v):
    global array, set_i
    log.debug(f"Set({i}, {v})")
    array[i] = v
    set_i = i

def on_less(address, i, j):
    global less_i, less_j, set_i
    log.debug(f"Less({i}, {j})")
    less_i, less_j = i, j
    set_i = None

def on_swap(address, i, j):
    global swap_i, swap_j, set_i
    log.debug(f"Swap({i}, {j})")
    swap_i, swap_j = i, j
    array[i], array[j] = array[j], array[i]
    set_i = None

def on_name(address, name):
    global change_name
    log.debug(f"Name({name})")
    change_name = name

def draw(screen: pygame.Surface):
    try:
        w = screen.get_width() / len(array)
        screen_h = screen.get_height()

        m = max((x for x in array if x is not None))

        for i, v in enumerate(array):
            if v is None:
                continue

            color = 'white'
            if i == swap_i or i == swap_j:
                color = 'green'
            if i == less_i or i == less_j or i == set_i:
                color = 'red'

            h = screen_h / m * v
            pygame.draw.rect(screen, color, pygame.Rect(w * i, screen_h - h, w - 0.02, h))
    except Exception as e:
        print(e)

def main():
    global change_name
    pygame.init()
    screen = pygame.display.set_mode((768, 576))
    clock = pygame.time.Clock()

    dispatch = Dispatcher()
    dispatch.map('/reset', on_reset)
    dispatch.map('/set', on_set)
    dispatch.map('/swap', on_swap)
    dispatch.map('/less', on_less)
    dispatch.map('/name', on_name)

    server = osc_server.BlockingOSCUDPServer(("127.0.0.1", 8888), dispatch)
    log.info(f"Listening on {server.server_address}")
    th = threading.Thread(target=lambda: server.serve_forever())
    th.start()

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        if change_name is not None:
            pygame.display.set_caption(change_name)
            change_name = None

        screen.fill('black')
        draw(screen)
        pygame.display.flip()
        clock.tick(60)

    pygame.quit()
    os._exit(0) # TODO: Nicer method to quit server thread


if __name__ == "__main__":
    main()
