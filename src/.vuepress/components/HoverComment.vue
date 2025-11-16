<template>
  <span class="hover-comment-marker"
        @mouseenter="startHover"
        @mouseleave="stopHover">


    <!-- 使用 transition 包裹 Tooltip -->
    <transition name="fade">
      <span v-if="show" class="hover-comment-box" @mousedown.stop @click.stop>
        <button class="close-btn" @click.stop="closeBox">×</button>
        <span v-html="htmlComment"></span>
      </span>
    </transition>

    <!-- 点击文字或 [?] 切换显示 -->
    <span class="clickable-area">
      <span @click.stop="toggleBox" v-html="text"></span>
      <sup @click.stop="toggleBox">[?]</sup>
    </span>

  </span>
</template>

<script setup>
import { ref, computed } from "vue";
import { marked } from "marked";

const props = defineProps({
  text: { type: String, required: true },
  comment: { type: String, required: true }
});

const hover = ref(false);
const locked = ref(false);

const show = computed(() => hover.value || locked.value);

let timer;

// 鼠标进入，启动定时器
const startHover = () => {
  timer = setTimeout(() => {
    hover.value = true;
  }, 350);
};

// 鼠标离开，清除定时器
const stopHover = () => {
  clearTimeout(timer);
  if (!locked.value) hover.value = false;
};

const toggleBox = () => {
  locked.value = !locked.value;
  hover.value = true;
};

const closeBox = () => {
  locked.value = false;
  hover.value = false;
};

const text = computed( () => marked.parse(props.text));
const htmlComment = computed(() => marked.parse(props.comment));

</script>

<style scoped>
.hover-comment-marker {
  cursor: pointer;
  position: relative;
}

.hover-comment-box {
  position: absolute;
  display: inline-block;
  background-color: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  top: 130%;
  left: 0;
  z-index: 30;

  /* 设置最大宽度，不超过视口宽度的60%或750像素 */
  max-width: min(60vw, 750px);
  max-height: min(60vh, 500px);
  width: auto;

  resize: both;
  overflow: auto;

  font-size: 14px;
  line-height: 1.55;
}

.close-btn {
  position: absolute;
  top: 6px;
  right: 6px;

  border: none;
  background: #eee;
  color: #333;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;

  width: 20px;
  height: 20px;
  padding: 0;
  line-height: 17px;
  border-radius: 50%;
  transition: background 0.2s;
}
.close-btn:hover {
  background: #ddd;
}

.hover-comment-box code {
  background: #f4f4f4;
  padding: 2px 4px;
  border-radius: 4px;
}

.hover-comment-box pre {
  background: #f4f4f4;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.clickable-area {
  cursor: pointer;
  display: flex;
  align-items: center;
}
</style>
