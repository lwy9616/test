<template>
  <div id="app">
  
    <transition name="rotate-fall">
    <router-view  class="app-router-view"></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
body,p,h1,h2,h3,h4,h5,h6,ul,ol,dl,li,dt,dd{
    /* 默认有边距，都要清除 */
    margin: 0;
    padding: 0;
    /*字体设置*/
    font-size: 14px;
    font-family: "Microsoft Yahei",sans-serif;
    list-style: none;

    
}
html,body{
	width: 100%;
	height: 100%;
}
div{
	box-sizing: border-box;
}
.clearfix::before,
.clearfix::after{
    content:"";
    height: 0;
    line-height: 0;
    display: block;
    visibility: none;
    clear: both;
}
.clearfix {
    *zoom: 1;
}
#app {
  	width: 100%;
	height: 100%;

}
.app-router-view {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    overflow: hidden;
    backface-visibility: hidden;
    transform: translate3d(0, 0, 0);
    transform-style: preserve-3d;
    visibility: visible;
  }
</style>
