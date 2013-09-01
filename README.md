# ardrone-panorama

Capture your world like never before!

Autonomously fly a ARDrone 2.0 to desired altitude and rotate the drone
to take a sequence of 8 pictures at 45° intervals to form a 360° panoramic
view. 

## Usage

Specify the panorama altitude (in meters) with the `-h` argument. The rotation
is currently fixed to 45°, but it should be changed to a custom setting in the
future.

`./bin/panorama -h 3`

If you place the 'oriented roundel' tag (that you have received with your drone) 
on the floor, the drone will attempt to maintain itself over the tag and land back
on the tag. 

## Install

Panorama requires a recent nodejs (built and tested with node > 0.10) as well as
[npm](https://npmjs.org/) for dependency management.

```
git clone https://github.com/eschnou/ardrone-panorama.git
cd ardrone-panorama
npm install
```

## License

The MIT License

Copyright (c) 2013 by Laurent Eschenauer <laurent@eschenauer.be>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
