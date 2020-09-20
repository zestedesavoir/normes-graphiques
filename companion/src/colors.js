import color_names from './colors_names.json'

function hue_to_rgb (p, q, t) {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1.0 / 6.0) return p + (q - p) * 6 * t
  if (t < 1.0 / 2.0) return q
  if (t < 2.0 / 3.0) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hsl_to_rgb (h, s, l) {
  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue_to_rgb(p, q, h + 1.0 / 3.0)
    g = hue_to_rgb(p, q, h)
    b = hue_to_rgb(p, q, h - 1.0 / 3.0)
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

/**
 * Converts a CSS value (that may be a number or a percent value) to a real value
 * (percent values are converted to [0;1]).
 */
function css_percent_value (val) {
  if (val.indexOf('%') !== -1) {
    return parseFloat(val) / 100
  } else {
    return parseFloat(val)
  }
}

/**
 * Converts a real float value (between 0 and 1) to a CSS percent value.
 */
function css_percent_format (val) {
  val = (val * 100).toFixed(2)
  return `${val.endsWith('.00') ? parseInt(val) : val}%`
}

/**
 * Converts a HSL CSS entry (format “hsl(198, 22%, 18%)”) to RGB (format “#AABBCC”).
 */
export function css_hsl_to_rgb (hsl) {
  hsl = hsl.toLowerCase().replace('hsl(', '').replace(')', '').split(',')
  const rgb = hsl_to_rgb(parseFloat(hsl[0]) / 360.0, css_percent_value(hsl[1]), css_percent_value(hsl[2]))
  return `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`.toUpperCase()
}

/**
 * Converts a CSS color string to HSL components.
 *
 * @param {String} css A CSS color string. Supported: RGB, RGBA, hex RGB, hex RGBA, HSL, HSLA, and standard color names.
 * @return {Array} An array with the HSL components (hue in degrees, saturation & luminosity in [0;1]), and a fourth value
 *                 representing the opacity (if set), or `false` (if unset).
 */
export function css_any_to_hsl_components (css) {
  css = css.toLowerCase().trim()

  if (css.startsWith('hsl(')) {
    return css_hsl_to_hsl_components(css)
  } else if (css.startsWith('hsla(')) {
    return css_hsla_to_hsl_components(css)
  } else if (css.startsWith('rgb(')) {
    return css_rgb_to_hsl_components(css)
  } else if (css.startsWith('rgba(')) {
    return css_rgba_to_hsl_components(css)
  } else if (css.startsWith('#')) {
    return css_hex_to_hsl_components(css)
  } else if (color_names[css] !== undefined) {
    return css_hex_to_hsl_components(color_names[css])
  }
}

export function hsl_components_to_css (hsl) {
  if (!hsl) {
    return ''
  }

  const h = hsl[0]
  const s = css_percent_format(hsl[1])
  const l = css_percent_format(hsl[2])
  const a = hsl[3]

  if (a !== false) {
    return `hsla(${h}, ${s}, ${l}, ${a})`
  } else {
    return `hsl(${h}, ${s}, ${l})`
  }
}

export function hsl_components_to_hex (hsl) {
  if (!hsl) {
    return ''
  }

  const h = hsl[0]
  const s = hsl[1]
  const l = hsl[2]
  let a = hsl[3] || false

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x
  }
  // Having obtained RGB, convert channels to hex
  r = Math.round((r + m) * 255).toString(16)
  g = Math.round((g + m) * 255).toString(16)
  b = Math.round((b + m) * 255).toString(16)

  if (a !== false && a < 1) {
    a = Math.round(a * 255).toString(16)
  } else {
    a = false
  }

  // Prepend 0s, if necessary
  if (r.length === 1) {
    r = '0' + r
  }
  if (g.length === 1) {
    g = '0' + g
  }
  if (b.length === 1) {
    b = '0' + b
  }

  return '#' + (r + g + b + (a !== false ? a : '')).toUpperCase()
}

function css_hsl_to_hsl_components (hsl) {
  const sep = hsl.indexOf(',') > -1 ? ',' : ' '
  hsl = hsl.substr(4).split(')')[0].split(sep)

  let h = hsl[0]

  const s = hsl[1].substr(0, hsl[1].length - 1) / 100
  const l = hsl[2].substr(0, hsl[2].length - 1) / 100

  // Strip label and convert to degrees (if necessary)
  if (h.indexOf('deg') > -1) {
    h = h.substr(0, h.length - 3)
  } else if (h.indexOf('rad') > -1) {
    h = Math.round(h.substr(0, h.length - 3) * (180 / Math.PI))
  } else if (h.indexOf('turn') > -1) {
    h = Math.round(h.substr(0, h.length - 4) * 360)
  } else {
    h = parseFloat(h)
  }

  // Keep hue fraction of 360 if ending up over
  if (h >= 360) {
    h %= 360
  }

  return [h, s, l, false]
}

function css_hsla_to_hsl_components (hsla) {
  const sep = hsla.indexOf(',') > -1 ? ',' : ' '
  hsla = hsla.substr(5).split(')')[0].split(sep)

  if (hsla.indexOf('/') > -1) {
    hsla.splice(3, 1)
  }

  let h = hsla[0]
  const s = hsla[1].substr(0, hsla[1].length - 1) / 100
  const l = hsla[2].substr(0, hsla[2].length - 1) / 100
  const a = hsla[3].trim()

  if (h.indexOf('deg') > -1) {
    h = h.substr(0, h.length - 3)
  } else if (h.indexOf('rad') > -1) {
    h = Math.round(h.substr(0, h.length - 3) * (180 / Math.PI))
  } else if (h.indexOf('turn') > -1) {
    h = Math.round(h.substr(0, h.length - 4) * 360)
  } else {
    h = parseFloat(h)
  }

  if (h >= 360) {
    h %= 360
  }

  return [h, s, l, a]
}

/**
 * Converts a RGB CSS entry (format “rgb(12, 255, 128)” or “rgb(12 255 128)”) to HSL
 * components (list with hue, saturation, lightness).
 *
 * @param {String} rgb The CSS RGB representation.
 * @return {Array} The HSL components.
 */
function css_rgb_to_hsl_components (rgb) {
  const sep = rgb.indexOf(',') > -1 ? ',' : ' '

  rgb = rgb.substr(4).split(')')[0].split(sep)

  for (const R in rgb) {
    const r = rgb[R]
    if (r.indexOf('%') > -1) {
      rgb[R] = Math.round(r.substr(0, r.length - 1) / 100 * 255)
    }
  }

  // Make r, g, and b fractions of 1
  const r = rgb[0] / 255
  const g = rgb[1] / 255
  const b = rgb[2] / 255

  return [...rgb_to_hsl_components(r, g, b), false]
}

function css_rgba_to_hsl_components (rgba) {
  const sep = rgba.indexOf(',') > -1 ? ',' : ' '
  rgba = rgba.substr(5).split(')')[0].split(sep)

  // Strip the slash if using space-separated syntax
  if (rgba.indexOf('/') > -1) {
    rgba.splice(3, 1)
  }

  for (const R in rgba) {
    const r = rgba[R]
    if (r.indexOf('%') > -1) {
      const p = r.substr(0, r.length - 1) / 100

      if (R < 3) {
        rgba[R] = Math.round(p * 255)
      } else {
        rgba[R] = p
      }
    }
  }

  // Make r, g, and b fractions of 1
  const r = rgba[0] / 255
  const g = rgba[1] / 255
  const b = rgba[2] / 255
  const a = rgba[3].trim()

  return [...rgb_to_hsl_components(r, g, b), a]
}

function css_hex_to_hsl_components (hex) {
  let r = 0
  let g = 0
  let b = 0
  let a = false

  // First two if there is no opacity (RGB)
  // Last two if there is opacity (RGBA)
  if (hex.length === 4) {
    r = '0x' + hex[1] + hex[1]
    g = '0x' + hex[2] + hex[2]
    b = '0x' + hex[3] + hex[3]
  } else if (hex.length === 7) {
    r = '0x' + hex[1] + hex[2]
    g = '0x' + hex[3] + hex[4]
    b = '0x' + hex[5] + hex[6]
  } else if (hex.length === 5) {
    r = '0x' + hex[1] + hex[1]
    g = '0x' + hex[2] + hex[2]
    b = '0x' + hex[3] + hex[3]
    a = '0x' + hex[4] + hex[4]
  } else if (hex.length === 9) {
    r = '0x' + hex[1] + hex[2]
    g = '0x' + hex[3] + hex[4]
    b = '0x' + hex[5] + hex[6]
    a = '0x' + hex[7] + hex[8]
  }

  r /= 255
  g /= 255
  b /= 255
  if (a !== false) {
    a = (a / 255).toFixed(2)
  }

  return [...rgb_to_hsl_components(r, g, b), a]
}

/**
 * Converts a RGB components (each one fraction of 1) to HSL components (list with hue,
 * saturation, lightness).
 *
 * @param {Number} r The red amount (in [0, 1])
 * @param {Number} r The red amount (in [0, 1])
 * @return {Array} The HSL components.
 */
function rgb_to_hsl_components (r, g, b) {
  // Find greatest and smallest channel values
  const cmin = Math.min(r, g, b)
  const cmax = Math.max(r, g, b)
  const delta = cmax - cmin

  let h = 0
  let s = 0
  let l = 0

  // Calculate hue
  // No difference
  if (delta === 0) {
    h = 0
  } else if (cmax === r) { // Red is max
    h = ((g - b) / delta) % 6
  } else if (cmax === g) { // Green is max
    h = (b - r) / delta + 2
  } else { // Blue is max
    h = (r - g) / delta + 4
  }

  h = Math.round(h * 60)

  // Make negative hues positive behind 360°
  if (h < 0) {
    h += 360
  }

  // Calculate lightness
  l = (cmax + cmin) / 2

  // Calculate saturation
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

  return [h, s, l]
}

/**
 * Converts degrees to radians, ensuring the result is between -π and π.
 *
 * @param {Number} deg The value in degrees
 * @return {Number} The value in radians, in [-π ; π].
 */
function deg_to_rad (deg) {
  let rad = deg / 180 * Math.PI
  while (rad > Math.PI) {
    rad -= 2 * Math.PI
  }
  return rad
}

/**
 * Finds the nearest color of the input in the colors.
 *
 * Using distance calculation on cylindrical coordinates system (Gonzales et al. 2007).
 *
 * @param {Array} hsl The input color components [h, s, l, a] (a may be false if there is no opacity)
 * @param {Object} colors The colors to search the nearest color into, an object variable name => hsl components (as above)
 *
 * @return {Object} The nearest color found in a object with the keys `scss` (the SCSS variable, may include a rgba function) and
 *                  `css` (the CSS code).
 */
export function find_nearest_color (hsl, colors) {
  let best_score = null
  let best_color = null

  if (!hsl || hsl.length < 3) return null

  const h1 = deg_to_rad(parseFloat(hsl[0]))
  const s1 = hsl[1]
  const l1 = hsl[2]

  // For each color of the palette, we compute the color distance to the input color
  // to select the closest one.
  Object.keys(colors).forEach(color_name => {
    const color = colors[color_name]

    const h2 = deg_to_rad(parseFloat(color[0]))
    const s2 = color[1]
    const l2 = color[2]

    // First we compute the color's score
    const distance = 4 * s1 * s2 * Math.pow(Math.sin((h1 - h2) / 2), 2) +
      Math.pow(l1 - l2, 2) +
      Math.pow(s1 - s2, 2)

    // If the distance is null but the color not the same, it's a distance value
    // unusable for comparison. TODO check why this happens.
    if (distance === 0 && !(h1 === h2 && s1 === s2 && l1 === l2)) {
      return
    }

    if (best_score === null || best_score > distance) {
      best_score = distance
      best_color = color_name
    }
  })

  // Then, we convert the given color to SCSS, for direct usage. If there is no
  // opacity, it's simple, we only use the variable. Else, we use the rgba SCSS
  // function, and we convert the opacity to decimal, if needed, as required by
  // this function.
  let scss = best_color
  let a = hsl[3] || false

  if (a !== false && a < 1) {
    if (a.indexOf('%') > -1) {
      a = parseFloat(a.substr(0, a.length - 1)) / 100
    } else {
      a = parseFloat(a)
    }

    scss = `rgba(${best_color}, ${a})`
  }

  // To generate the CSS for the live preview, we get the HSL components
  // from the best color and replace the alpha value with our own, so it's
  // reflected.
  const hsl_components = colors[best_color]
  hsl_components[3] = a

  return {
    scss,
    css: hsl_components_to_css(hsl_components),
    rgb: hsl_components_to_hex(hsl_components)
  }
}
