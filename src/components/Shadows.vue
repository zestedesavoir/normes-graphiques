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
      shadows_raw: `
        @mixin shadow-1 {
            box-shadow: 0 1px 3px hsla(0, 0%, 0%, .12),
                        0 1px 2px hsla(0, 0%, 0%, .24);
        }

        @mixin shadow-2 {
            box-shadow: 0 3px 6px hsla(0, 0%, 0%, .15),
                        0 2px 4px hsla(0, 0%, 0%, .12);
        }

        @mixin shadow-3 {
            box-shadow: 0 10px 20px hsla(0, 0%, 0%, .15),
                        0  3px  6px hsla(0, 0%, 0%, .10);
        }

        @mixin shadow-4 {
            box-shadow: 0 15px 25px hsla(0, 0%, 0%, .15),
                        0  5px 10px hsla(0, 0%, 0%, .5);
        }

        @mixin shadow-5 {
            box-shadow: 0 20px 40px hsla(0, 0%, 0%, .3)
        }

        @mixin shadow-6 {
            box-shadow: 0 20px 40px hsla(0, 0%, 0%, .5)
        }
      `
    }
  },
  computed: {
    shadows () {
      return this.shadows_raw
        .split('}')
        .map(s => s.trim())
        .map(s => s.split('{'))
        .filter(s => s[0].trim() !== '')
        .map(s => {
          return {
            name: s[0].replace('@mixin', '').trim(),
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

    @include mobile
      width: calc(100% - 2rem)
</style>
