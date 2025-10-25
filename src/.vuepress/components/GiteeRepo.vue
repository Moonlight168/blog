<template>
  <div class="vp-nav-item vp-action vp-icon-item"> <!-- 直接用主题类名 -->
    <a
        :href="giteeUrl"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Gitee"
        title="Gitee"
        class="vp-action-link"
    >
      <img src="/assets/icon/gitee.svg" alt="Gitee" class="icon" />
    </a>
  </div>
</template>

<script setup lang="ts">
const giteeUrl = "https://gitee.com/wish168";
</script>


<style lang="scss">
.vp-icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 2.3rem;
  padding-top: 3.5px;
  padding-left: 2px;
  cursor: pointer;
  &:hover {
    background-color: var(--vp-c-bg-hover);
  }
  .icon {
    height: 1.3rem;
    width: 1.3rem;
  }
}

</style>