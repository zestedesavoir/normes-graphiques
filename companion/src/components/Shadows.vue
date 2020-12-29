<template>
  <section class="shadows">
    <article
      class="shadow style-item"
      v-for="(shadow, i) in shadows"
      :key="i"
      :style="{ 'box-shadow': shadow.css }"
    >
      <h2>
        <div>
          Ombre {{ shadow.id }}
          <code>{{ shadow.include }}</code>
        </div>
        <Copy
          :copy="shadow.include"
          label="Copier le code SCSS"
        />
      </h2>
      <pre>box-shadow: {{ shadow.css }};</pre>
    </article>
  </section>
</template>

<script>
import Copy from './Copy.vue'

export default {
  data () {
    return {
      sass_shadows: require('./../../../standards/sass/shadows.sass').default
    }
  },
  computed: {
    shadows () {
      return this.sass_shadows
        .split('@mixin')
        .map(s => s.trim())
        .filter(s => !!s)
        .map(s => s.split('\n'))
        .map(s => {
          return {
            name: s[0].trim(),
            css: s[1].trim().replace('box-shadow:', '').replace('\n', '').replace(/ +/g, ' ').replace(';', '').trim().replace('),', `),\n${Array('box-shadow: '.length).join(' ')}`)
          }
        })
        .map(s => {
          return {
            ...s,
            id: s.name.replace('shadow-', ''),
            include: `@incude ${s.name};`
          }
        })
    }
  },
  components: {
    Copy
  }
}
</script>

<style lang="sass">
@import "~bulma/sass/utilities/mixins"

.shadows
  display: flex
  flex-wrap: wrap

  .shadow
    width: calc(50% - 2rem)
    border-color: transparent

    @include mobile
      width: calc(100% - 2rem)
</style>
