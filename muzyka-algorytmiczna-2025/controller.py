import argparse
import inputs
import throttle
import pythonosc.udp_client


parser = argparse.ArgumentParser()
parser.add_argument("--ip", default="127.0.0.1")
parser.add_argument("--port", default=4560, type=int)
parser.add_argument("mode")
args = parser.parse_args()

client = pythonosc.udp_client.SimpleUDPClient(args.ip, args.port)



# @throttle.wrap(0.1, 1)
def send(*args):
    client.send_message(*args)


if args.mode == "mouse":
    while 1:
        events = inputs.get_mouse()
        mousex, mousey = 0, 0
        for event in events:
            print(event.ev_type, event.code, event.state)

            if event.ev_type == "Relative" and event.code == "REL_X":
                mousex += event.state
            elif event.ev_type == "Relative" and event.code == "REL_Y":
                mousey += event.state

        if mousex != 0 or mousey != 0:
            send("/mouse/move", [mousex, mousey])
elif args.mode == "gamepad":
    while 1:
        events = inputs.get_gamepad()
        left, right = 0, 0
        btn_pressed = None
        btn_released = None

        for event in events:
            if event.ev_type == "Absolute" and event.code == "ABS_Z":
                left = event.state
                pass
            elif event.ev_type == "Absolute" and event.code == "ABS_RZ":
                right = event.state
            elif event.ev_type == "Key":
                send(f"/gamepad/{event.code}", event.state)
            else:
                print(event.ev_type, event.code, event.state)

        if left != 0:
            send("/gamepad/left", left)
        if right != 0:
            send("/gamepad/right", right)


elif args.mode == "keyboard":
    assert False, "not implemented yet"



    events = inputs.get_gamepad()
    for event in events:
        print(event.ev_type, event.code, event.state)



