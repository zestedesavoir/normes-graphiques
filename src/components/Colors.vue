<template>
  <section class="colors-palette">
    <article
      class="palette"
      v-for="(palette, i) in palettes"
      :key="i"
    >
      <h1>
        {{ palette.name }}
        <code v-if="palette.variable">{{ palette.variable }}</code>
      </h1>
      <ul :class="{ 'has-variables': palette.variable === false }">
        <li
          class="color-preview"
          v-for="([shade, color_value], j) in Object.entries(palette.palette).sort((a, b) => a[0] - b[0])"
          :key="j"
        >
          <span
            class="color"
            :style="{ 'background-color': color_value.hsl }"
            :title="color_value.rgb + ' ⋅ ' + color_value.hsl"
            @click="copy(palette.variable || color_value.variable, shade, color_value)"
            @mouseenter="on_hover(palette.variable, shade)"
            @mouseleave="on_hover_exit(palette.variable, shade)"
          />
          <span
            class="name"
            v-if="is_copied(palette.variable || color_value.variable, shade)"
          >Copié !</span>
          <span
            class="name"
            v-else-if="is_hovered(palette.variable, shade)"
          >Copier</span>
          <span
            class="name"
            v-else
          >
            <template v-if="palette.variable !== false">{{ shade }}</template>
            <code v-else>{{ color_value.variable }}</code>
          </span>
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
              HSL
              <code>hsl(199, 85%, 21%)</code>
            </span>
          </b-dropdown-item>

          <b-dropdown-item
            value="rgb"
            aria-role="listitem"
          >
            <span>
              RGB
              <code>#F8AB30</code>
            </span>
          </b-dropdown-item>
        </b-dropdown>
      </p>
    </footer>

    <aside class="box closest-color-tool">
      <h1>Trouver la couleur la plus proche dans la palette</h1>
      <div class="color-input">
        <b-input
          type="text"
          size="is-medium"
          v-model="input_color_to_convert"
          placeholder="RGB(A), HSL(A), HEX(A), ou nom"
        />
      </div>
      <div class="color-output">
        <div class="original color-preview">
          <span
            class="color"
            :style="{ 'background-color': convert_original_hovered && converted_color ? converted_color.css : input_color_to_convert }"
            @mouseenter="convert_original_hovered = true"
            @mouseleave="convert_original_hovered = false"
          />
          <span class="name">
            <template v-if="convert_original_hovered && converted_color">Palette</template>
            <template v-else>Originale</template><br>
            <em v-if="converted_color"><span class="desktop-inline">Survolez</span><span
              class="mobile-inline"
              aria-hidden="true"
            >Tapotez</span> pour comparer</em>
          </span>
        </div>
        <div class="arrow">
          →
        </div>
        <div class="arrow-mobile">
          ↓
        </div>
        <div class="output color-preview">
          <span
            class="color"
            :style="{ 'background-color': converted_color ? converted_color.css : 'white' }"
            @click="copy_converted"
          />
          <span class="name">
            <template v-if="converted_color">
              <code v-if="!copy_color">{{ converted_color.scss }}</code>
              <code v-else-if="copy_format === 'hsl'">{{ converted_color.css }}</code>
              <code v-else>{{ converted_color.rgb }}</code>
            </template>
            <template v-else>Convertie</template><br>
            <em v-if="converted_color && !convert_output_copied">
              <span class="desktop-inline">Cliquez</span><span
                class="mobile-inline"
                aria-hidden="true"
              >Touchez</span> pour copier
            </em>
            <em v-else-if="converted_color && convert_output_copied">Copié !</em>
          </span>
        </div>
      </div>
    </aside>
  </section>
</template>

<script>
import { css_hsl_to_rgb, css_any_to_hsl_components, find_nearest_color } from '../colors'

export default {
  data () {
    return {
      copy_color: false,
      copy_format: 'hsl',
      hovered: '',
      copied: '',
      raw_palette: {
        'Teintes primaires': `
        $primary-000: hsl(198, 40%, 87%);
        $primary-100: hsl(198, 49%, 69%);
        $primary-200: hsl(197, 50%, 52%);
        $primary-300: hsl(198, 100%, 34%);
        $primary-400: hsl(199, 84%, 32%);
        $primary-500: hsl(199, 84%, 27%);
        $primary-600: hsl(199, 85%, 21%);
        $primary-700: hsl(199, 87%, 18%);
        $primary-800: hsl(199, 92%, 15%);
        $primary-900: hsl(199, 97%, 13%);
        `,
        "Teintes d'accentuation": `
        $accent-000: hsl(51, 50%, 95%);
        $accent-100: hsl(42, 73%, 91%);
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
        $purple-000: hsl(262, 92%, 97%);
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
        $red-000: hsl(360, 100%, 97%);
        $red-100: hsl(360, 82%, 89%);
        $red-200: hsl(360, 77%, 78%);
        $red-300: hsl(360, 71%, 66%);
        $red-400: hsl(360, 64%, 55%);
        $red-500: hsl(360, 67%, 44%);
        $red-600: hsl(360, 72%, 38%);
        $red-700: hsl(360, 79%, 32%);
        $red-800: hsl(360, 85%, 25%);
        $red-900: hsl(360, 92%, 20%);
        `,
        'Teintes de vert': `
        $green-000: hsl(83, 88%, 94%);
        $green-100: hsl(84, 77%, 86%);
        $green-200: hsl(83, 68%, 74%);
        $green-300: hsl(83, 63%, 61%);
        $green-400: hsl(83, 55%, 52%);
        $green-500: hsl(83, 64%, 42%);
        $green-600: hsl(83, 70%, 34%);
        $green-700: hsl(83, 74%, 27%);
        $green-800: hsl(81, 78%, 21%);
        $green-900: hsl(81, 86%, 14%);
        `,
        'Teintes de bleu': `
        $blue-000: hsl(216, 100%, 93%);
        $blue-100: hsl(216, 100%, 85%);
        $blue-200: hsl(219, 95%, 76%);
        $blue-300: hsl(222, 81%, 65%);
        $blue-400: hsl(224, 69%, 54%);
        $blue-500: hsl(223, 71%, 47%);
        $blue-600: hsl(228, 74%, 43%);
        $blue-700: hsl(230, 80%, 38%);
        $blue-800: hsl(232, 86%, 32%);
        $blue-900: hsl(234, 90%, 25%);
        `,
        'Teintes de gris': `
        $grey-000: hsl(216, 33%, 97%);
        $grey-100: hsl(214, 15%, 91%);
        $grey-200: hsl(210, 16%, 82%);
        $grey-300: hsl(211, 13%, 65%);
        $grey-400: hsl(211, 10%, 53%);
        $grey-500: hsl(211, 12%, 43%);
        $grey-600: hsl(209, 14%, 37%);
        $grey-700: hsl(209, 18%, 30%);
        $grey-800: hsl(209, 20%, 25%);
        $grey-900: hsl(210, 24%, 16%);
        `,
        'Noirs et blancs': `
        $true-white: hsl(0, 0%, 100%);
        $white: hsl(0, 0%, 98%);
        $black: hsl(0, 0%, 6%);
        $true-black: hsl(0, 0%, 0%);
        `
      },

      input_color_to_convert: '',
      convert_original_hovered: false,
      convert_output_hovered: false,
      convert_output_copied: false
    }
  },

  computed: {
    palettes () {
      return Object.keys(this.raw_palette).map(name => {
        const scss = this.raw_palette[name]
        let variable = null

        const palette = Object.fromEntries(
          scss
            .split('\n')
            .map(line => {
              line = line.trim()
              if (!line) return null

              const parts = line.split(':', 2)
              const this_variable = `${parts[0].split('-')[0]}-*`

              if (variable === null) {
                variable = this_variable
              } else if (variable !== this_variable) { //  If there is not a constant variable prefix
                variable = false
              }

              const hsl = parts[1].trim().replace(';', '')
              const rgb = css_hsl_to_rgb(hsl)
              const name = variable !== false ? parts[0].split('-', 2)[1] : parts[0]

              return [name, { hsl, rgb, variable: parts[0] }]
            })
            .filter(line => line !== null)
        )

        return { name, variable, palette }
      })
    },

    colors () {
      return Object.fromEntries(
        Object.values(this.palettes)
          .flatMap(palette => Object.keys(palette.palette)
            .map(color_id => [palette.variable ? palette.variable.replace('*', color_id) : palette.palette[color_id].variable, css_any_to_hsl_components(palette.palette[color_id].hsl)]))
      )
    },

    converted_color () {
      return this.input_color_to_convert ? find_nearest_color(css_any_to_hsl_components(this.input_color_to_convert), this.colors) : null
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
    },
    copy_converted () {
      let copy = ''

      if (this.copy_color) {
        copy = this.copy_format === 'rgb' ? this.converted_color.rgb : this.converted_color.css
      } else {
        copy = this.converted_color.scss
      }

      navigator.clipboard.writeText(copy)

      this.convert_output_copied = true
      setTimeout(() => { this.convert_output_copied = false }, 2000)
    }
  }
}
</script>

<style lang="sass">
@import "bulma/sass/utilities/mixins"

.color-preview
  display: inline-flex
  flex-direction: column
  align-items: center

  margin: 0 .4rem 1rem

  text-align: center

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

      code
        margin: 0
        font-size: 1em

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

    &.has-variables
      li
        width: 8rem

        +mobile
          display: flex
          flex-direction: row
          align-items: center

          width: 100%

          .name
            margin-left: 1.5rem

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

aside.closest-color-tool
  margin: 1.5rem

  h1
    margin-bottom: 1.5rem
    font-size: .9rem
    color: hsl(199, 85%, 21%)

    +mobile
      text-align: center

  .color-input
    width: 60%
    margin: auto

    +mobile
      width: 100%

  .color-output
    display: flex
    flex-direction: row
    align-items: baseline
    justify-content: center

    +mobile
      flex-direction: column
      align-items: center

    margin-top: 2rem

    .arrow, .arrow-mobile
      font-size: 2rem
      text-align: center

      color: hsl(199, 87%, 18%)

      user-select: none

    .arrow-mobile
      display: none
      margin: .5rem 0 1.5rem

    +mobile
      .arrow
        display: none
      .arrow-mobile
        display: block

    .original, .output
      flex: 1

.mobile, .mobile-inline
  display: none

.desktop
  display: block

.desktop-inline
  display: inline

+mobile
  article.palette
    flex-direction: column

    h1
      padding-top: 0

    ul
      padding: 0

  .desktop, .desktop-inline
    display: none

  .mobile
    display: block

  .mobile-inline
    display: inline
</style>
