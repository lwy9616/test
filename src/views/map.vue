<template>
  <div class="content">
    <div id="webContainer">
      
</div>
    asd
  </div>
</template>

<script>
export default {
  created() {
  
    
  },
  data() {
    return {
map3dView:null,
sceneTool:null,
    }
  },
   computed: {},
   methods: {
       mapInit(){
         let option1 = {
        infoBox: true,//初始化默认信息框初
    };

    let option2 = {
        navigation: true,
        images: [
            {
                name: "google",  //'TdtImage',
                type: "UrlTemplate",   //'ZMapImage',
                url: 'http://www.google.cn/maps/vt?'
                    +'lyrs=s@748&gl=cn&x={x}&y={y}&z={z}',
                visible: true,
                // maximumLevel: 30, // 设置最大显示层级
                scheme: "Geographic-level-0"
            }
        ]

    };
        let that =this

            this.map3dView = new ZMap3D.Map('webContainer',option1,option2);

            /*添加鼠标位置信息显示*/
             this.map3dView.AddControl(
                new GmMap3D.MousePositionCtl({map:that.map3dView})
            );

            /*设置复位坐标和级别*/

             this.map3dView.SetResetCenterAndZoom(121.5481,29.86,17)

            let viewer =  this.map3dView.GetView()

            this.sceneTool = new SceneControl(that.map3dView, viewer);
            this.sceneTool.resetAround();
            
       },
      


  },
  mounted() {
this.mapInit()
   
  },
}
</script>

<style>

</style>
