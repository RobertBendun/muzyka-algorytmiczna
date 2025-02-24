#!/usr/bin/env python3
import glob
import os.path
import runpy

if __name__ == "__main__":
    for fname in set(glob.glob('*.py')) - {os.path.basename(__file__)}:
        runpy.run_path(fname)
