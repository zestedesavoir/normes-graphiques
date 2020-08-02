<template>
  <section class="colors-palette">
    <article
      class="palette"
      v-for="(palette, i) in palettes"
      :key="i"
    >
      <h1>
        {{ palette.name }}
        <code>{{ palette.variable }}</code>
      </h1>
      <ul>
        <li
          v-for="([shade, color_value], j) in Object.entries(palette.palette)"
          :key="j"
        >
          <span
            class="color"
            :style="{ 'background-color': color_value.hsl }"
            :title="color_value.rgb + ' ⋅ ' + color_value.hsl"
            @click="copy(palette.variable, shade, color_value)"
            @mouseenter="on_hover(palette.variable, shade)"
            @mouseleave="on_hover_exit(palette.variable, shade)"
          />
          <span
            class="name"
            v-if="is_copied(palette.variable, shade)"
          >Copié !</span>
          <span
            class="name"
            v-else-if="is_hovered(palette.variable, shade)"
          >Copier</span>
          <span
            class="name"
            v-else
          >{{ shade }}</span>
        </li>
      </ul>
    </article>
    <footer class="copy-switch">
      <p @click="copy_color = false">
        Copier la variable SCSS
      </p>
      <b-switch v-model="copy_color" />
      <p @click="copy_color = true">
        Copier la couleur
        <b-dropdown
          v-model="copy_format"
          position="is-top-left"
          aria-role="list"
        >
          <button
            class="button is-text"
            type="button"
            slot="trigger"
          >
            au format {{ copy_format.toUpperCase() }}
          </button>

          <b-dropdown-item
            value="hsl"
            aria-role="listitem"
          >
            <span>
              HSL <code>hsl(199, 85%, 21%)</code>
            </span>
          </b-dropdown-item>

          <b-dropdown-item
            value="rgb"
            aria-role="listitem"
          >
            <span>
              RGB <code>#F8AB30</code>
            </span>
          </b-dropdown-item>
        </b-dropdown>
      </p>
    </footer>
  </section>
</template>

<script>
function hue2rgb (p, q, t) {
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
function hslToRgb (h, s, l) {
  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1.0 / 3.0)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1.0 / 3.0)
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

/**
 * Converts a CSS value (that may be a number or a percent value) to a real value
 * (percent values are converted to [0;1]).
 */
function cssPercentValue (val) {
  if (val.indexOf('%') !== -1) {
    return parseFloat(val) / 100
  } else {
    return parseFloat(val)
  }
}

/**
 * Converts a HSL CSS entry (format “hsl(198, 22%, 18%)”) to RGB (format “#AABBCC”).
 */
function cssHSL2RGB (hsl) {
  hsl = hsl.toLowerCase().replace('hsl(', '').replace(')', '').split(',')
  const rgb = hslToRgb(parseFloat(hsl[0]) / 360.0, cssPercentValue(hsl[1]), cssPercentValue(hsl[2]))
  return `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`.toUpperCase()
}

export default {
  data () {
    return {
      copy_color: false,
      copy_format: 'hsl',
      hovered: '',
      copied: '',
      raw_palette: {
        'Teintes primaires': `
        $primary-100: hsl(198, 22%, 91%);
        $primary-200: hsl(201, 30%, 74%);
        $primary-300: hsl(198, 29%, 56%);
        $primary-400: hsl(199, 41%, 39%);
        $primary-500: hsl(199, 56%, 30%);
        $primary-600: hsl(199, 85%, 21%);
        $primary-700: hsl(199, 87%, 18%);
        $primary-800: hsl(199, 92%, 15%);
        $primary-900: hsl(199, 97%, 13%);
        `,
        'Teintes d\'accentuation': `
        $accent-100: hsl(51, 50%, 95%);
        $accent-200: hsl(40, 78%, 87%);
        $accent-300: hsl(38, 86%, 80%);
        $accent-400: hsl(38, 90%, 73%);
        $accent-500: hsl(37, 92%, 65%);
        $accent-600: hsl(37, 93%, 58%);
        $accent-700: hsl(29, 80%, 44%);
        $accent-800: hsl(22, 82%, 39%);
        $accent-900: hsl(15, 86%, 30%);
        `,
        'Teintes de violet': `
        $purple-100: hsl(264, 36%, 89%);
        $purple-200: hsl(264, 35%, 82%);
        $purple-300: hsl(265, 35%, 74%);
        $purple-400: hsl(265, 34%, 67%);
        $purple-500: hsl(265, 34%, 59%);
        $purple-600: hsl(264, 34%, 52%);
        $purple-700: hsl(264, 43%, 44%);
        $purple-800: hsl(264, 58%, 37%);
        $purple-900: hsl(264, 82%, 29%);
        `,
        'Teintes de rouge': `
        $red-100: hsl(360, 100%, 97%);
        $red-200: hsl(360, 82%, 89%);
        $red-300: hsl(360, 77%, 78%);
        $red-400: hsl(360, 64%, 55%);
        $red-500: hsl(360, 67%, 44%);
        $red-600: hsl(360, 72%, 38%);
        $red-700: hsl(360, 79%, 32%);
        $red-800: hsl(360, 85%, 25%);
        $red-900: hsl(360, 92%, 20%);
        `,
        'Teintes de vert': `
        $green-100: hsl(83, 88%, 94%);
        $green-200: hsl(84, 77%, 86%);
        $green-300: hsl(83, 68%, 74%);
        $green-400: hsl(83, 55%, 52%);
        $green-500: hsl(83, 64%, 42%);
        $green-600: hsl(83, 70%, 34%);
        $green-700: hsl(83, 74%, 27%);
        $green-800: hsl(81, 78%, 21%);
        $green-900: hsl(81, 86%, 14%);
        `,
        'Teintes de gris': `
        $grey-100: hsl(180, 8%, 95%);
        $grey-200: hsl(180, 4%, 84%);
        $grey-300: hsl(195, 3%, 73%);
        $grey-400: hsl(192, 3%, 63%);
        $grey-500: hsl(192, 2%, 52%);
        $grey-600: hsl(190, 3%, 41%);
        $grey-700: hsl(197, 5%, 30%);
        $grey-800: hsl(203, 8%, 19%);
        $grey-900: hsl(200, 22%, 8%);
        `
      }
    }
  },

  computed: {
    palettes () {
      return Object.keys(this.raw_palette).map(name => {
        const scss = this.raw_palette[name]
        let variable = null

        const palette = Object.fromEntries(scss.split('\n').map(line => {
          line = line.trim()
          if (!line) return null

          const parts = line.split(':', 2)

          if (!variable) {
            variable = `${parts[0].split('-')[0]}-*`
          }

          const hsl = parts[1].trim().replace(';', '')
          const rgb = cssHSL2RGB(hsl)

          return [parts[0].split('-', 2)[1], { hsl, rgb }]
        }).filter(line => line !== null))

        return { name, variable, palette }
      })
    }
  },

  methods: {
    is_hovered (variable, shade) {
      return this.hovered === variable + shade
    },
    is_copied (variable, shade) {
      return this.copied === variable + shade
    },
    on_hover (variable, shade) {
      this.hovered = variable + shade
    },
    on_hover_exit () {
      this.hovered = null
    },
    copy (variable, shade, color) {
      let copy = ''

      if (this.copy_color) {
        copy = this.copy_format === 'rgb' ? color.rgb : color.hsl
      } else {
        copy = variable.replace('*', shade)
      }

      navigator.clipboard.writeText(copy)

      this.copied = variable + shade
      setTimeout(() => { this.copied = null }, 2000)
    }
  }
}
</script>

<style lang="sass">
@import "bulma/sass/utilities/mixins"

article.palette
  margin: 1rem 0
  padding: 0
  display: flex
  align-items: flex-start

  &:not(:last-of-type)
    margin-top: 0
    margin-bottom: 1rem
    padding-bottom: .5rem
    border-bottom: solid 1px #eee

  h1
    flex: 1
    margin: .6rem .2rem
    padding-top: .4rem
    min-width: 10rem
    font-size: 1.2rem
    font-weight: bold
    color: #444

  code
    display: block

    margin-top: .4rem
    padding: 0

  ul
    list-style-type: none
    margin: 1rem 0 0 0

    li
      display: inline-flex
      flex-direction: column
      align-items: center
      margin: 0 .4rem 1rem

      span
        &.color
          display: block
          width: 3.2rem
          height: 3.2rem
          border-radius: 4px
          box-shadow: 0 -2px 0 hsla(0, 0%, 100%, 0.15), inset 0 2px 2px hsla(0, 0%, 0%, 0.1)
          cursor: pointer

        &.name
          display: inline-block
          margin-top: .6rem
          color: #777

footer.copy-switch
  display: flex
  margin: 2.5rem 1rem

  p
    flex: 1
    cursor: pointer

    &:first-child
      text-align: right

  .switch
    margin: 0 1rem

    .check
      background-color: hsl(199, 85%, 21%) !important

  .dropdown
    button
      position: relative
      top: -1px
      left: -2px

      padding: 0
      padding-right: .4rem

      height: 1em

      text-decoration: none

      vertical-align: middle
      user-select: text

      &:after
        content: ''
        display: block

        position: relative
        left: .4rem

        width: 0
        height: 0
        border-left: 5px solid transparent
        border-right: 5px solid transparent

        border-bottom: 5px solid currentColor

      &:hover, &:active, &:focus
        background: transparent

      &:hover
        color: black

      &:focus
        box-shadow: none

    .dropdown-item code
      display: block
      padding: 0
      color: hsl(198, 29%, 56%)

+mobile
  article.palette
    flex-direction: column

    h1
      padding-top: 0

    ul
      padding: 0
</style>
