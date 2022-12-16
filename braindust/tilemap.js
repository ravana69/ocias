// Generated by CoffeeScript 2.3.2
(function() {
  var I, IX, add_source, advect, bilerp, canvas, clamp, click, ctx, density, densitycanvas, densityctx, densityold, densitystep, diffuse, displaydebugtext, drawOffset, drawdensity, drawimagedata, drawing, drawparticles, drawtile, drawtilemap, drawvelocity, drawvelocitylines, enddraw, enforceboundaries, enforcedrains, getCursorPosition, getcurl, getvelocityat, gridsize, i, j, k, l, lastmouseX, lastmouseY, lerp, map, mouseX, mouseY, moveparticles, p, particles, project, ref, ref1, setFillStyle, spray, start, startdraw, tilesize, time, totalcells, update, upscale, ux, uxold, uy, uyold, velocitycanvas, velocityctx, velocitystep, vorticityconfinement;

  canvas = document.getElementById("tilemap");

  ctx = canvas.getContext("2d");

  gridsize = 64;

  tilesize = 8;

  upscale = 1;

  drawOffset = -tilesize;

  canvas.width = canvas.height = gridsize * tilesize;

  // canvas.style.width = canvas.width * upscale + "px"
  // canvas.style.height = canvas.height * upscale + "px"
  totalcells = (gridsize + 2) * (gridsize + 2); // plus two for boundary cell on either side

  density = new Array(totalcells);

  densityold = new Array(totalcells);

  ux = new Array(totalcells);

  uxold = new Array(totalcells);

  uy = new Array(totalcells);

  uyold = new Array(totalcells);

  map = new Array(totalcells);

  time = 0;

  i = 0;

  while (i < totalcells) {
    density[i] = densityold[i] = ux[i] = uxold[i] = uy[i] = uyold[i] = map[i] = 0;
    i++;
  }

  particles = new Array();

  for (i = k = 1, ref = gridsize; k <= ref; i = k += 3) {
    for (j = l = 1, ref1 = gridsize; l <= ref1; j = l += 3) {
      p = {
        x: (i + 0.5) * tilesize - 0.5,
        y: (j + 0.5) * tilesize - 0.5
      };
      particles.push(p);
    }
  }

  // console.log p.x / tilesize + "_" + p.y / tilesize
  densitycanvas = document.createElement("canvas");

  densitycanvas.height = densitycanvas.width = gridsize + 2;

  densityctx = densitycanvas.getContext("2d");

  velocitycanvas = document.createElement("canvas");

  velocitycanvas.height = velocitycanvas.width = gridsize + 2;

  velocityctx = velocitycanvas.getContext("2d");

  mouseX = mouseY = lastmouseX = lastmouseY = 0;

  drawtile = 0;

  drawing = false;

  spray = false;

  start = function() {
    var m, n, ref2, ref3;
// pre-fill some data for testing
    for (i = m = 0, ref2 = gridsize + 2; m <= ref2; i = m += 1) {
      // top
      map[IX(i, 0)] = 1;
      // map[IX i, 1] = 1
      // left
      map[IX(0, i)] = 1;
      // map[IX 1, i] = 1
      // bottom
      // map[IX i, gridsize] = 1
      map[IX(i, gridsize + 1)] = 1;
      //right
      // map[IX gridsize, i] = 1
      map[IX(gridsize + 1, i)] = 1;
    }

// for i in [2..63] by 1
// 	for j in [19..19] by 1
// 		map[IX j, i] = 1

// for i in [8..12] by 1
// 	map[IX 16, i] = 1
    for (i = n = 0, ref3 = totalcells; n <= ref3; i = n += 1) {
      ux[i] = uy[i] = 0;
    }
    document.addEventListener('click', click);
    document.addEventListener('mousedown', startdraw);
    document.addEventListener('mouseup', enddraw);
    canvas.addEventListener('mousemove', function(e) {
      mouseX = (getCursorPosition(canvas, e).x) | 0;
      return mouseY = (getCursorPosition(canvas, e).y) | 0;
    });
    document.addEventListener('touchmove', function(e) {
      var rect;
      rect = canvas.getBoundingClientRect();
      mouseX = event.touches[0].clientX - rect.left - drawOffset;
      return mouseY = event.touches[0].clientY - rect.top - drawOffset;
    });
    document.addEventListener('touchstart', startdraw);
    document.addEventListener('touchend', enddraw);
    return window.requestAnimationFrame(update);
  };

  startdraw = function(event) {
    var pos;
    pos = getCursorPosition(canvas, event);
    if (event.which === 1) {
      drawtile = !map[IX(pos.x / tilesize, pos.y / tilesize)];
      return drawing = true;
    } else {
      return spray = true;
    }
  };

  enddraw = function(event) {
    drawing = false;
    return spray = false;
  };

  update = function() {
    var dt, m, n, ref2, ref3, x, y;
    // turbulence!
    // for i in [0..totalcells] by 1
    // 	ux[i] += (Math.random() - 0.5) * 0.1
    // 	uy[i] += (Math.random() - 0.5) * 0.1
    dt = 1 / 60;
    time += dt;
    densitystep(dt);
    velocitystep(dt);
    moveparticles();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
// drawimagedata()
    for (x = m = 0, ref2 = gridsize + 2; (0 <= ref2 ? m <= ref2 : m >= ref2); x = 0 <= ref2 ? ++m : --m) {
      for (y = n = 0, ref3 = gridsize + 2; (0 <= ref3 ? n <= ref3 : n >= ref3); y = 0 <= ref3 ? ++n : --n) {
        if (map[IX(x, y)]) {
          ux[IX(x, y)] = 0;
          ux[IX(x + 1, y)] = 0;
          uy[IX(x, y)] = 0;
          uy[IX(x, y + 1)] = 0;
        }
      }
    }
    // drawvelocity()
    drawdensity();
    drawparticles();
    drawtilemap();
    
    // drawvelocitylines()
    window.requestAnimationFrame(update);
    lastmouseX = mouseX;
    return lastmouseY = mouseY;
  };

  
  // displaydebugtext()
  displaydebugtext = function() {
    var m, n, o, q, ref2, ref3, ref4, ref5, totalDensity, totalEnergy;
    totalDensity = 0;
    for (i = m = 1, ref2 = gridsize; (1 <= ref2 ? m <= ref2 : m >= ref2); i = 1 <= ref2 ? ++m : --m) {
      for (j = n = 1, ref3 = gridsize; (1 <= ref3 ? n <= ref3 : n >= ref3); j = 1 <= ref3 ? ++n : --n) {
        totalDensity += density[IX(i, j)];
      }
    }
    totalEnergy = 0;
    for (i = o = 1, ref4 = gridsize; (1 <= ref4 ? o <= ref4 : o >= ref4); i = 1 <= ref4 ? ++o : --o) {
      for (j = q = 1, ref5 = gridsize; (1 <= ref5 ? q <= ref5 : q >= ref5); j = 1 <= ref5 ? ++q : --q) {
        totalEnergy += Math.abs(ux[IX(i, j)]);
        totalEnergy += Math.abs(uy[IX(i, j)]);
      }
    }
    return document.getElementById("debug").innerHTML = `D: ${totalDensity}<br/>E: ${totalEnergy}`;
  };

  moveparticles = function() {
    var len, m, results, vel;
    results = [];
    for (m = 0, len = particles.length; m < len; m++) {
      p = particles[m];
      vel = getvelocityat(p.x / tilesize, p.y / tilesize);
      p.x += vel.x * gridsize / 3;
      p.y += vel.y * gridsize / 3;
      if (p.x > gridsize * tilesize || p.x < tilesize * 1.5) {
        p.x = Math.random() * gridsize * tilesize;
        p.y = Math.random() * gridsize * tilesize;
      }
      if (p.y > gridsize * tilesize || p.y < tilesize * 1.5) {
        p.x = Math.random() * gridsize * tilesize;
        results.push(p.y = Math.random() * gridsize * tilesize);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  drawparticles = function() {
    var len, m, results;
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    results = [];
    for (m = 0, len = particles.length; m < len; m++) {
      p = particles[m];
      results.push(ctx.fillRect(p.x + drawOffset - 0.5, p.y + drawOffset - 0.5, 2, 2));
    }
    return results;
  };

  densitystep = function(dt) {
    // if time > 2
    density[IX(32, 1)] = (Math.sin(time - 2) + 2) * 1.25;
    density[IX(33, 1)] = (Math.sin(time - 2) + 2) * 1.25;
    density[IX(32, 2)] = (Math.sin(time - 2) + 2) * 1.25;
    density[IX(33, 2)] = (Math.sin(time - 2) + 2) * 1.25;
    uy[IX(32, 2)] += (Math.sin(time) + 1) * 1;
    uy[IX(32, 3)] += (Math.sin(time) + 1) * 1;
    uy[IX(33, 2)] += (Math.sin(time) + 1) * 1;
    uy[IX(33, 3)] += (Math.sin(time) + 1) * 1;
    // densityold = density.slice 0
    // diffuse(gridsize, 0, density, densityold, 0.001, dt)
    densityold = density.slice(0);
    return advect(gridsize, 0, density, densityold, ux, uy, dt, 0, 0);
  };

  // densityold = density.slice 0
  // add_source gridsize, density, densityold, dt
  enforcedrains = function() {};

  // ux[IX 0+20, 0+20] = 10
  // ux[IX 1+20, 0+20] = -10
  // uy[IX 0+20, 0+20] = 10
  // uy[IX 0+20, 1+20] = -10
  velocitystep = function(dt) {
    var cellx, celly;
    cellx = Math.floor(mouseX / tilesize);
    celly = Math.floor(mouseY / tilesize);
    cellx = clamp(cellx, 2, gridsize - 1);
    celly = clamp(celly, 2, gridsize - 1);
    if (cellx > 0 && cellx < gridsize + 1 && celly > 0 && celly < gridsize + 1) {
      ux[IX(cellx - 1, celly)] += (mouseX - lastmouseX) * 0.5;
      uy[IX(cellx, celly - 1)] += (mouseY - lastmouseY) * 0.5;
      ux[IX(cellx, celly)] += (mouseX - lastmouseX) * 0.5;
      uy[IX(cellx, celly)] += (mouseY - lastmouseY) * 0.5;
      ux[IX(cellx + 1, celly)] += (mouseX - lastmouseX) * 0.5;
      uy[IX(cellx, celly + 1)] += (mouseY - lastmouseY) * 0.5;
    }
    if (drawing) {
      map[IX(mouseX / tilesize, mouseY / tilesize)] = drawtile;
    }
    if (spray) {
      density[IX(mouseX / tilesize, mouseY / tilesize)] = 2;
      density[IX(mouseX / tilesize - 1, mouseY / tilesize)] = 2;
      density[IX(mouseX / tilesize + 1, mouseY / tilesize)] = 2;
      density[IX(mouseX / tilesize, mouseY / tilesize - 1)] = 2;
      density[IX(mouseX / tilesize, mouseY / tilesize + 1)] = 2;
    }
    enforceboundaries();
    uxold = ux.slice(0);
    uyold = uy.slice(0);
    advect(gridsize, 0, ux, uxold, ux, uy, dt, -0.5, 0);
    advect(gridsize, 0, uy, uyold, ux, uy, dt, 0, -0.5);
    uxold = ux.slice(0);
    uyold = uy.slice(0);
    project(gridsize, ux, uy, uxold, uyold);
    vorticityconfinement(null, null, dt);
    add_source(gridsize, ux, uxold, dt);
    return add_source(gridsize, uy, uyold, dt);
  };

  vorticityconfinement = function(vcX, vcY, dt) {
    var curlData, dx, dy, m, n, norm, o, q, ref2, ref3, ref4, ref5, v;
    curlData = (function() {
      var m, ref2, results;
      results = [];
      for (m = 0, ref2 = totalcells; (0 <= ref2 ? m <= ref2 : m >= ref2); 0 <= ref2 ? m++ : m--) {
        results.push(0);
      }
      return results;
    })();
    vcX = (function() {
      var m, ref2, results;
      results = [];
      for (m = 0, ref2 = totalcells; (0 <= ref2 ? m <= ref2 : m >= ref2); 0 <= ref2 ? m++ : m--) {
        results.push(0);
      }
      return results;
    })();
    vcY = (function() {
      var m, ref2, results;
      results = [];
      for (m = 0, ref2 = totalcells; (0 <= ref2 ? m <= ref2 : m >= ref2); 0 <= ref2 ? m++ : m--) {
        results.push(0);
      }
      return results;
    })();
// console.log ux
// Calculate magnitude of curl(i, j) for each cell
    for (i = m = 1, ref2 = gridsize; (1 <= ref2 ? m <= ref2 : m >= ref2); i = 1 <= ref2 ? ++m : --m) {
      for (j = n = 1, ref3 = gridsize; (1 <= ref3 ? n <= ref3 : n >= ref3); j = 1 <= ref3 ? ++n : --n) {
        curlData[IX(i, j)] = Math.abs(getcurl(i, j));
      }
    }
    for (i = o = 1, ref4 = gridsize; (1 <= ref4 ? o <= ref4 : o >= ref4); i = 1 <= ref4 ? ++o : --o) {
      for (j = q = 1, ref5 = gridsize; (1 <= ref5 ? q <= ref5 : q >= ref5); j = 1 <= ref5 ? ++q : --q) {
        // Calculate the derivative of the magnitude (n = del |w|)
        dx = (curlData[IX(i + 1, j)] - curlData[IX(i, j)]) * 0.5;
        dy = (curlData[IX(i, j + 1)] - curlData[IX(i, j)]) * 0.5;
        norm = Math.sqrt((dx * dx) + (dy * dy));
        if (norm === 0) {
          // Avoid divide by zero
          norm = 1;
        }
        dx /= norm;
        dy /= norm;
        v = getcurl(i, j);
        // N x W
        vcX[IX(i, j)] = dy * v * -1;
        vcY[IX(i, j)] = dx * v;
      }
    }
    add_source(gridsize, ux, vcX, dt);
    return add_source(gridsize, uy, vcY, dt);
  };

  getcurl = function(i, j) {
    var duDy, dvDx;
    duDy = ux[IX(i, j + 1)] - ux[IX(i, j)] * 0.5;
    dvDx = uy[IX(i + 1, j)] - uy[IX(i, j)] * 0.5;
    return duDy - dvDx;
  };

  getvelocityat = function(x, y) {
    var xvel, yvel;
    xvel = bilerp(ux, x, y - 0.5);
    yvel = bilerp(uy, x - 0.5, y);
    return {
      x: xvel,
      y: yvel
    };
  };

  bilerp = function(sample, x, y) {
    var p00, p01, p10, p11, x0, x1, y0, y1;
    x0 = x | x;
    y0 = y | y;
    x1 = x0 + 1;
    y1 = y0 + 1;
    p00 = sample[IX(x0, y0)];
    p01 = sample[IX(x0, y1)];
    p10 = sample[IX(x1, y0)];
    p11 = sample[IX(x1, y1)];
    return lerp(lerp(p00, p10, x - x0), lerp(p01, p11, x - x0), y - y0);
  };

  lerp = function(a, b, c) {
    return a * (1 - c) + b * c;
  };

  add_source = function(N, x, s, dt) {
    var m, ref2, results, size;
    size = (N + 2) * (N + 2);
    results = [];
    for (i = m = 0, ref2 = size; (0 <= ref2 ? m < ref2 : m > ref2); i = 0 <= ref2 ? ++m : --m) {
      results.push(x[i] += dt * s[i]);
    }
    return results;
  };

  diffuse = function(N, b, x, x0, diff, dt) {
    var a, down, left, m, n, o, ref2, ref3, results, right, sumOfAdjacentCells, up;
    a = dt * diff * N * N;
    results = [];
    for (var m = 0; m < 1; m++) {
      for (i = n = 1, ref2 = N; (1 <= ref2 ? n <= ref2 : n >= ref2); i = 1 <= ref2 ? ++n : --n) {
        for (j = o = 1, ref3 = N; (1 <= ref3 ? o <= ref3 : o >= ref3); j = 1 <= ref3 ? ++o : --o) {
          // if map[IX i, j]
          // 	continue
          left = x[IX(i - 1, j)];
          right = x[IX(i + 1, j)];
          up = x[IX(i, j - 1)];
          down = x[IX(i, j + 1)];
          if (map[IX(i - 1, j)]) {
            left = x[IX(i, j)];
          } else {
            left = x[IX(i - 1, j)];
          }
          if (map[IX(i + 1, j)]) {
            right = x[IX(i, j)];
          } else {
            right = x[IX(i + 1, j)];
          }
          if (map[IX(i, j - 1)]) {
            up = x[IX(i, j)];
          } else {
            up = x[IX(i, j - 1)];
          }
          if (map[IX(i, j + 1)]) {
            down = x[IX(i, j)];
          } else {
            down = x[IX(i, j + 1)];
          }
          sumOfAdjacentCells = left + right + up + down;
          // console.log sumOfAdjacentCells
          x[IX(i, j)] = (x0[IX(i, j)] + a * sumOfAdjacentCells) / (1 + 4 * a);
        }
      }
      results.push(enforceboundaries());
    }
    return results;
  };

  project = function(N, u, v, p, div) {
    var h, m, n, o, q, ref2, ref3, ref4, ref5, ref6, ref7, t, w, z;
    // keep resolution independent
    h = 1.0 / N;
// for each cell, find DIVERGENCE
    for (i = m = 1, ref2 = N; (1 <= ref2 ? m <= ref2 : m >= ref2); i = 1 <= ref2 ? ++m : --m) {
      for (j = n = 1, ref3 = N; (1 <= ref3 ? n <= ref3 : n >= ref3); j = 1 <= ref3 ? ++n : --n) {
        // get the delta of velocities
        div[IX(i, j)] = -h * (u[IX(i + 1, j)] - u[IX(i, j)] + v[IX(i, j + 1)] - v[IX(i, j)]);
        // do we move to a -0.5+0.5 index scheme for velocities?
        // div[IX(i,j)] = -h*(u[IX(i+0.5,j)]-u[IX(i-0.5,j)]+v[IX(i,j+0.5)]-v[IX(i,j-0.5)])
        p[IX(i, j)] = 0;
      }
    }
// enforceboundaries()
// poisson to solve PRESSURE GRADIENT
    for (var o = 0; o < 20; o++) {
      for (i = q = 1, ref4 = N; (1 <= ref4 ? q <= ref4 : q >= ref4); i = 1 <= ref4 ? ++q : --q) {
        for (j = t = 1, ref5 = N; (1 <= ref5 ? t <= ref5 : t >= ref5); j = 1 <= ref5 ? ++t : --t) {
          if (map[IX(i, j)]) {
            p[IX(i, j)] = 0;
          }
          // pressure here equals velocity delta plus adjacent pressure divided by 4?
          // this fills in the array every iteration, and smooths it over time
          // this is a relaxation algorithm!!!!
          p[IX(i, j)] = (div[IX(i, j)] + p[IX(i - 1, j)] + p[IX(i + 1, j)] + p[IX(i, j - 1)] + p[IX(i, j + 1)]) / 4;
        }
      }
    }
// enforcedrains()
// enforceboundaries()
// finally, deduct the pressure gradient from our velocity gradients!
    for (i = w = 1, ref6 = N; (1 <= ref6 ? w <= ref6 : w >= ref6); i = 1 <= ref6 ? ++w : --w) {
      for (j = z = 1, ref7 = N; (1 <= ref7 ? z <= ref7 : z >= ref7); j = 1 <= ref7 ? ++z : --z) {
        u[IX(i, j)] -= 0.5 * (p[IX(i + 1, j)] - p[IX(i - 1, j)]) / h;
        v[IX(i, j)] -= 0.5 * (p[IX(i, j + 1)] - p[IX(i, j - 1)]) / h;
      }
    }
    // enforceboundaries()
    return enforceboundaries();
  };

  clamp = function(value, min, max) {
    return Math.min(Math.max(min, value), max);
  };

  // move density around using velocity, based on where our current density would have been in the past
  advect = function(N, b, d, d0, u, v, dt, xoffset = 0, yoffset = 0) {
    var bl, bottomIndex, bottomPortion, bottomleft, bottomright, br, dt0, interpolatedValue, leftIndex, leftPortion, leftoverportion, m, n, oldvalue, ref2, ref3, rightIndex, rightPortion, tl, topIndex, topPortion, topleft, topright, tr, vel, x, y;
    // scale to keep simulation resolution independent
    dt0 = dt * N;
    for (i = m = 1, ref2 = N; (1 <= ref2 ? m <= ref2 : m >= ref2); i = 1 <= ref2 ? ++m : --m) {
      for (j = n = 1, ref3 = N; (1 <= ref3 ? n <= ref3 : n >= ref3); j = 1 <= ref3 ? ++n : --n) {
        vel = getvelocityat(i + 0.5 + xoffset, j + 0.5 + yoffset);
        // get x and y pos by projecting cell's velocity backwards
        x = i - dt0 * vel.x;
        y = j - dt0 * vel.y;
        // clamp within 0.5, array size - 0.5
        if (x < 0.5) {
          x = 0.5;
        }
        if (x > N + 0.5) {
          x = N + 0.5;
        }
        // find cell indices left and right
        leftIndex = Math.floor(x);
        rightIndex = leftIndex + 1;
        // clamp within 0.5, array size -0.5
        if (y < 0.5) {
          y = 0.5;
        }
        if (y > N + 0.5) {
          y = N + 0.5;
        }
        // find cell indices top and bottom
        topIndex = Math.floor(y);
        bottomIndex = topIndex + 1;
        // get proportional distance to nearby cells
        rightPortion = x - leftIndex;
        leftPortion = 1 - rightPortion;
        bottomPortion = y - topIndex;
        topPortion = 1 - bottomPortion;
        leftoverportion = 0;
        tl = leftPortion * topPortion;
        bl = leftPortion * bottomPortion;
        tr = rightPortion * topPortion;
        br = rightPortion * bottomPortion;
        // interpolate cell velocities and set.
        topleft = tl * d0[IX(leftIndex, topIndex)];
        bottomleft = bl * d0[IX(leftIndex, bottomIndex)];
        topright = tr * d0[IX(rightIndex, topIndex)];
        bottomright = br * d0[IX(rightIndex, bottomIndex)];
        interpolatedValue = topleft + bottomleft + topright + bottomright;
        oldvalue = d[IX(i, j)];
        d[IX(i, j)] = interpolatedValue;
      }
    }
    // add_source(gridsize, d, d0, 1)
    return enforceboundaries();
  };

  lerp = function(a, b, c) {
    return a * (1 - c) + b * c;
  };

  drawimagedata = function() {
    var d, imageData, m, ref2;
    imageData = densityctx.createImageData(gridsize + 2, gridsize + 2);
    d = imageData.data;
    for (i = m = 0, ref2 = d.length; m <= ref2; i = m += 4) {
      d[i] = Math.random() * 255;
      d[i + 3] = 255;
    }
    // d[i+1] = 200
    // i++
    // console.log i
    densityctx.putImageData(imageData, 0, 0);
    densityctx.imageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    return ctx.drawImage(densitycanvas, 0, 0, (gridsize + 2) * tilesize, (gridsize + 2) * tilesize);
  };

  // ctx.imageSmoothingEnabled = true
  // console.log imageData
  drawvelocity = function() {
    var d, imageData, m, n, ref2, ref3;
    densityctx.clearRect(0, 0, densitycanvas.width, densitycanvas.height);
    imageData = densityctx.createImageData(gridsize + 2, gridsize + 2);
    d = imageData.data;
    for (i = m = 0, ref2 = ux.length; m <= ref2; i = m += 1) {
      d[i * 4] = 128 + ux[i] * 128;
      d[i * 4 + 2] = 255;
      d[i * 4 + 3] = 255;
    }
    densityctx.putImageData(imageData, 0, 0);
    ctx.globalCompositeOperation = "lighten";
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(densitycanvas, gridsize * tilesize + 50 - tilesize / 2, 0, (gridsize + 2) * tilesize, (gridsize + 2) * tilesize);
    densityctx.clearRect(0, 0, densitycanvas.width, densitycanvas.height);
    imageData = densityctx.createImageData(gridsize + 2, gridsize + 2);
    d = imageData.data;
    for (i = n = 0, ref3 = uy.length; n <= ref3; i = n += 1) {
      d[i * 4 + 1] = 128 + uy[i] * 128;
      d[i * 4 + 2] = 255;
      d[i * 4 + 3] = 255;
    }
    densityctx.putImageData(imageData, 0, 0);
    ctx.globalCompositeOperation = "lighten";
    ctx.imageSmoothingEnabled = true;
    return ctx.drawImage(densitycanvas, gridsize * tilesize + 50, 0 - tilesize / 2, (gridsize + 2) * tilesize, (gridsize + 2) * tilesize);
  };

  drawvelocitylines = function() {
    var m, n, ref2, ref3, vel;
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    for (i = m = 1, ref2 = gridsize; (1 <= ref2 ? m <= ref2 : m >= ref2); i = 1 <= ref2 ? ++m : --m) {
      for (j = n = 1, ref3 = gridsize; (1 <= ref3 ? n <= ref3 : n >= ref3); j = 1 <= ref3 ? ++n : --n) {
        ctx.moveTo(gridsize * tilesize + 50 + i * tilesize + tilesize / 2, j * tilesize + tilesize / 2);
        vel = getvelocityat(i + 0.5, j + 0.5);
        ctx.lineTo(gridsize * tilesize + 50 + i * tilesize + tilesize / 2 + vel.x * tilesize * 2, j * tilesize + tilesize / 2 + vel.y * tilesize * 2);
      }
    }
    return ctx.stroke();
  };

  drawdensity = function() {
    var d, imageData, m, ref2;
    densityctx.clearRect(0, 0, densitycanvas.width, densitycanvas.height);
    imageData = densityctx.createImageData(gridsize + 2, gridsize + 2);
    d = imageData.data;
    for (i = m = 0, ref2 = uy.length; m <= ref2; i = m += 1) {
      d[i * 4 + 0] = density[i] * 255;
      d[i * 4 + 1] = density[i] * 0;
      d[i * 4 + 2] = density[i] * 152;
      d[i * 4 + 3] = density[i] * 255;
    }
    densityctx.putImageData(imageData, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.imageSmoothingEnabled = true;
    return ctx.drawImage(densitycanvas, drawOffset, drawOffset, (gridsize + 2) * tilesize, (gridsize + 2) * tilesize);
  };

  drawtilemap = function() {
    var d, imageData, m, ref2;
    densityctx.clearRect(0, 0, densitycanvas.width, densitycanvas.height);
    imageData = densityctx.createImageData(gridsize + 2, gridsize + 2);
    d = imageData.data;
    for (i = m = 0, ref2 = map.length; m <= ref2; i = m += 1) {
      d[i * 4] = map[i] * 50;
      d[i * 4 + 1] = map[i] * 33;
      d[i * 4 + 2] = map[i] * 65;
      d[i * 4 + 3] = map[i] * 255;
    }
    densityctx.putImageData(imageData, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.imageSmoothingEnabled = false;
    return ctx.drawImage(densitycanvas, drawOffset, drawOffset, (gridsize + 2) * tilesize, (gridsize + 2) * tilesize);
  };

  enforceboundaries = function() {
    var m, ref2, results, x, y;
    results = [];
    for (x = m = 0, ref2 = gridsize + 2; (0 <= ref2 ? m <= ref2 : m >= ref2); x = 0 <= ref2 ? ++m : --m) {
      results.push((function() {
        var n, ref3, results1;
        results1 = [];
        for (y = n = 0, ref3 = gridsize + 2; (0 <= ref3 ? n <= ref3 : n >= ref3); y = 0 <= ref3 ? ++n : --n) {
          if (map[IX(x, y)] || x === 0 || y === 0 || x === gridsize + 1 || y === gridsize + 1) {
            ux[IX(x, y)] = 0;
            ux[IX(x + 1, y)] = 0;
            uy[IX(x, y)] = 0;
            uy[IX(x, y + 1)] = 0;
            results1.push(density[IX(x, y)] = 0);
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      })());
    }
    return results;
  };

  // 	ux[IX(0, i)] = ux[IX(1,i)]
  // 	ux[IX(gridsize+1,i)] = ux[IX(gridsize,i)]
  // ux[IX(0, i)] = 0
  // ux[IX(gridsize+1,i)] = 0

  // uy[IX(i,0)] = -uy[IX(i,1)]
  // uy[IX(i,gridsize+1)] = -uy[IX(i,gridsize)]

  // 	uy[IX(i,0)] = 0
  // 	uy[IX(i,gridsize+1)] = 0

  // x[IX(0 ,0 )] = 0.5*(x[IX(1,0 )]+x[IX(0 ,1)])
  // x[IX(0 ,N+1)] = 0.5*(x[IX(1,N+1)]+x[IX(0 ,N )])
  // x[IX(N+1,0 )] = 0.5*(x[IX(N,0 )]+x[IX(N+1,1)])
  // x[IX(N+1,N+1)] = 0.5*(x[IX(N,N+1)]+x[IX(N+1,N)])
  I = function(x, y) {};

  IX = function(x, y) {
    return (x | x) + (gridsize + 2) * (y | y);
  };

  setFillStyle = function(context, r, g, b) {
    r = r * 255;
    g = g * 255;
    b = b * 255;
    return context.fillStyle = `rgba(${r},${g},${b},1)`;
  };

  click = function(event) {};

  // pos = getCursorPosition canvas, event
  // map[IX Math.floor(pos.x / tilesize), Math.floor(pos.y / tilesize)] = 1 - map[IX Math.floor(pos.x / tilesize), Math.floor(pos.y / tilesize)]
  // # density[IX Math.floor(pos.x / tilesize), Math.floor(pos.y / tilesize)] = 10
  // density[IX Math.floor(pos.x / tilesize) - 1, Math.floor(pos.y / tilesize)] = 10
  // density[IX Math.floor(pos.x / tilesize), Math.floor(pos.y / tilesize) - 1] = 10
  // density[IX Math.floor(pos.x / tilesize) + 1, Math.floor(pos.y / tilesize)] = 10
  // density[IX Math.floor(pos.x / tilesize), Math.floor(pos.y / tilesize) + 1] = 10
  getCursorPosition = function(canvas, event) {
    var rect, x, y;
    rect = canvas.getBoundingClientRect();
    x = event.clientX - rect.left - drawOffset;
    y = event.clientY - rect.top - drawOffset;
    return {
      x: x,
      y: y
    };
  };

  start();

}).call(this);
