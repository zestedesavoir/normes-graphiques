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

      sass_colors: require('./../../../standards/sass/colors.sass').default,

      input_color_to_convert: '',
      convert_original_hovered: false,
      convert_output_hovered: false,
      convert_output_copied: false
    }
  },

  computed: {
    raw_palettes () {
      const palettes = []

      let current_palette = null
      let current_palette_name = null

      for (let sass_line of this.sass_colors.split('\n')) {
        sass_line = sass_line.trim()

        // Potential end of a group, and beginning of the next one
        if (sass_line.startsWith('//')) {
          if (current_palette !== null) {
            palettes.push({
              name: current_palette_name.trim(),
              sass: current_palette.trim()
            })
          }

          current_palette_name = sass_line.replace('//', '').trim()
          current_palette = ''
        } else if (sass_line.startsWith('$')) {
          // Variable in the group
          current_palette += sass_line + '\n'
        }
      }

      // We push the last one
      palettes.push({
        name: current_palette_name.trim(),
        sass: current_palette.trim()
      })

      return palettes
    },

    palettes () {
      return this.raw_palettes.map(({ name, sass }) => {
        let variable = null

        const palette = Object.fromEntries(
          sass
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
@import "zestedesavoir-standards"

.color-preview
  display: inline-flex
  flex-direction: column
  align-items: center

  margin: 0 $length-4 $length-10

  text-align: center

  span
    &.color
      display: block
      width: $length-32
      height: $length-32
      border-radius: $radius-1
      box-shadow: 0 -2px 0 hsla(0, 0%, 100%, 0.15), inset 0 2px 2px hsla(0, 0%, 0%, 0.1)
      cursor: pointer

    &.name
      display: inline-block
      margin-top: $length-6
      color: $grey-500

      code
        margin: 0
        font-size: 1em

article.palette
  display: flex
  align-items: flex-start

  margin: 0 0 $length-12 0
  padding: 0
  padding-bottom: $length-6

  border-bottom: solid 1px $grey-100

  h1
    margin: $length-6 $length-2
    padding-top: $length-4
    min-width: $length-192
    font-size: $size-11
    font-weight: bold
    color: $grey-700

  code
    display: block

    margin-top: $length-4
    padding: 0

  ul
    list-style-type: none
    margin: $length-10 0 0 0

    &.has-variables
      display: flex
      flex-direction: row
      flex-wrap: wrap
      align-items: flex-start

      +mobile
        flex-direction: column
        flex-wrap: nowrap

      flex: 2

      li
        width: $length-96

        display: flex
        flex-direction: row
        align-items: center

        width: calc(50% - #{$length-4} * 2)

        +mobile
          width: 100%

        .name
          margin-left: $length-16

footer.copy-switch
  display: flex
  margin: $length-32 $length-10

  p
    flex: 1
    cursor: pointer

    &:first-child
      text-align: right

  .switch
    margin: 0 $length-10

    .check
      background-color: hsl(199, 85%, 21%) !important

  .dropdown
    button
      position: relative
      top: -1px
      left: -2px

      padding: 0
      padding-right: $length-4

      height: 1em

      text-decoration: none

      vertical-align: middle
      user-select: text

      &:after
        content: ''
        display: block

        position: relative
        left: $length-4

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
  margin: $length-16
  padding-top: $length-8

  h1
    margin-bottom: $length-16
    font-weight: bold
    color: $primary-600

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

    margin-top: $length-20

    .arrow, .arrow-mobile
      font-size: $size-7
      text-align: center

      color: hsl(199, 87%, 18%)

      user-select: none

    .arrow-mobile
      display: none
      margin: $length-6 0 $length-16

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
