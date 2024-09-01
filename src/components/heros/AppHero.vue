<template>
  <div class="app-hero">
    <div class="mx-auto w-full max-w-lg">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-hero {
  @apply bg-cover bg-center flex items-center justify-center text-center px-4;
  padding-top: 96px;
  transition: all 0.3s ease-in-out;
  @media screen and (max-width: 768px) {
    padding-top: 32px;
  }
  /* background-image: url('/images/backgrounds/bg-header.svg'); */
  .max-w-lg {
    max-width: 56rem;
  }
}
</style>
