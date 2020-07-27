/**
 * 体数据绘制shader
 * @type {{filterVertexShaderPass: string [属性过滤顶点着色器],
 * filterFragmentShaderPass: string [属性过滤片元着色器],
 * vertexShaderPass: string [体数据绘制顶点着色器],
 * fragmentShaderPass: string [体数据绘制片元着色器],
 * sliceVertexShaderPass: string [切片顶点着色器],
 * sliceFragmentShaderPass: string [切片片元着色器]}}
 */
const GLSL_VOLUME = {
    filterVertexShaderPass: `
    varying vec4 worldPos;

    attribute float batchId;
    attribute vec3 position3DHigh;
    attribute vec3 position3DLow;

    vec4 czm_translateRelativeToEye2(vec3 high, vec3 low)
    {
        vec3 highDifference = high - czm_encodedCameraPositionMCHigh;
        vec3 lowDifference = low - czm_encodedCameraPositionMCLow;
        return vec4(highDifference + lowDifference, 1.0);
    }

    void main()
    {
        vec4 p = czm_translateRelativeToEye2(position3DHigh, position3DLow);
        gl_Position = czm_modelViewProjectionRelativeToEye * p;

        vec3 pos = position3DHigh + position3DLow;
        worldPos = czm_model * vec4(pos, 1.0);
    }    
    `,
    filterFragmentShaderPass: `
    varying vec4 worldPos;

    const int MAX_STEPS = 256;
    const float steps = 256.0;
    const float alphaCorrection = 0.10;
    const float zDataSliceNumber = 63.0;

    // Z方向-256层体数据变为64层体数据
    vec4 sampleAs3DTexture( vec3 texCoord )
    {
        vec4 colorSlice1, colorSlice2;
        vec2 texCoordSlice1, texCoordSlice2;
        
        //The z coordinate determines which Z slice we have to look for.
        //Z slice number goes from 0 to 255.
        float zSliceNumber1 = floor(texCoord.z * zDataSliceNumber);
        
        //As we use trilinear we go the next Z slice.
        float zSliceNumber2 = min( zSliceNumber1 + 1.0, zDataSliceNumber); //Clamp to 255
        
        //The Z slices are stored in a matrix of 16x16 of Z slices.
        //The original UV coordinates have to be rescaled by the tile numbers in each row and column.
        texCoord.xy /= 8.0;

        texCoordSlice1 = texCoordSlice2 = texCoord.xy;
                                    
        //Add an offset to the original UV coordinates depending on the row and column number.
        texCoordSlice1.x += (mod(zSliceNumber1, 8.0 ) / 8.0);
        texCoordSlice1.y += floor((zDataSliceNumber - zSliceNumber1) / 8.0) / 8.0;
            
        texCoordSlice2.x += (mod(zSliceNumber2, 8.0 ) / 8.0);
        texCoordSlice2.y += floor((zDataSliceNumber - zSliceNumber2) / 8.0) / 8.0;
        
        //Get the opacity value from the 2D texture.
        //Bilinear filtering is done at each texture2D by default.
        colorSlice1 = texture2D( cubeTex_0, texCoordSlice1 );
        colorSlice2 = texture2D( cubeTex_0, texCoordSlice2 );

        
        //Based on the opacity obtained earlier, get the RGB color in the transfer function texture.
        colorSlice1.rgb = texture2D( transferTex_1, vec2(colorSlice1.a, 1.0) ).rgb;
        colorSlice2.rgb = texture2D( transferTex_1, vec2(colorSlice2.a, 1.0) ).rgb;
        
        //How distant is zSlice1 to ZSlice2. Used to interpolate between one Z slice and the other.
        float zDifference = mod(texCoord.z * zDataSliceNumber, 1.0);

        //Finally interpolate between the two intermediate colors of each Z slice.
        //return mix(colorSlice1, colorSlice2, zDifference);

        float ft = zDifference * 3.1415926;
        float f = (1.0 - cos(ft) * 0.5);
        return mix(colorSlice1, colorSlice2, f);


        //float weight = abs(zSliceNumber2 / 64.0 - texCoord.z) / abs(zSliceNumber1 / 64.0 - zSliceNumber2 / 64.0);
        ///return mix(colorSlice1, colorSlice2, weight);
    }

    vec4 interAs3DTexture(vec3 curPos)
    {
        float x = curPos.x;
        float y = curPos.y;
        float z = curPos.z;

        float i = ceil(x/(1.0/256.0));
        float j = ceil(y/(1.0/256.0));

        float x5 = i*(1.0/256.0) - (1.0/512.0);
        float y5 = j*(1.0/256.0) - (1.0/512.0);

        float a1, a2; 
        vec4 temV1, temV2, v1, v2, v3, v4, interV;
        float d = distance((x,y),(x5,y5));
        vec4 v = sampleAs3DTexture(vec3(x5, y5, z));

        if(x<x5 && y<y5)
        {
            float x1 = (i-5.0)*(1.0/256.0) - (1.0/512.0);
            float y1 = (j-5.0)*(1.0/256.0) - (1.0/512.0); 
            float x2 = i*(1.0/256.0) - (1.0/512.0);
            float y2 = (j-5.0)*(1.0/256.0) - (1.0/512.0); 
            float x4 = (i-5.0)*(1.0/256.0) - (1.0/512.0);
            float y4 = j*(1.0/256.0) - (1.0/512.0); 

            v1 = sampleAs3DTexture(vec3(x1, y1, z));
            v2 = sampleAs3DTexture(vec3(x2, y2, z));
            v3 = sampleAs3DTexture(vec3(x4, y4, z));
            v4 = v;

            a1 = (x-x1)/(x2-x1);
            a2 = (y-y1)/(y4-y1);

            temV1 = mix(v1, v2, a1);
            temV2 = mix(v3, v4, a2);

            interV = vec4(1.0, 0.0, 0.0, 0.0);//mix(temV1, temV2, a2);
        }else if(x<x5 && y>y5)
        {
            float x4 = (i-5.0)*(1.0/256.0) - (1.0/512.0);
            float y4 = j*(1.0/256.0) - (1.0/512.0); 
            float x7 = (i-5.0)*(1.0/256.0) - (1.0/512.0);
            float y7 = (j+5.0)*(1.0/256.0) - (1.0/512.0); 
            float x8 = i*(1.0/256.0) - (1.0/512.0);
            float y8 = (j+5.0)*(1.0/256.0) - (1.0/512.0); 

            v1 = sampleAs3DTexture(vec3(x4, y4, z));
            v2 = v;
            v3 = sampleAs3DTexture(vec3(x7, y7, z));
            v4 = sampleAs3DTexture(vec3(x8, y8, z));

            a1 = (x-x4)/(x5-x4);
            a2 = (y-y4)/(y7-y4);

            temV1 = mix(v1, v2, a1);
            temV2 = mix(v3, v4, a2);

            interV = vec4(1.0, 0.0, 0.0, 1.0);//mix(temV1, temV2, a2);
        }else if(x>x5 && y<y5)
        {
            float x2 = i*(1.0/256.0) - (1.0/512.0);
            float y2 = (j-5.0)*(1.0/256.0) - (1.0/512.0); 
            float x3 = (i+5.0)*(1.0/256.0) - (1.0/512.0);
            float y3 = (j-5.0)*(1.0/256.0) - (1.0/512.0); 
            float x6 = (i+5.0)*(1.0/256.0) - (1.0/512.0);
            float y6 = j*(1.0/256.0) - (1.0/512.0); 

            v1 = sampleAs3DTexture(vec3(x2, y2, z));
            v2 = sampleAs3DTexture(vec3(x3, y3, z));
            v3 = v;
            v4 = sampleAs3DTexture(vec3(x6, y6, z));

            a1 = (x-x2)/(x3-x2);
            a2 = (y-y2)/(y5-y2);

            temV1 = mix(v1, v2, a1);
            temV2 = mix(v3, v4, a2);

            interV = vec4(1.0, 0.0, 0.0, 1.0);//mix(temV1, temV2, a2);
        }else if(x>x5 && y>y5)
        {
            float x6 = (i+5.0)*(1.0/256.0) - (1.0/512.0);
            float y6 = j*(1.0/256.0) - (1.0/512.0); 
            float x8 = i*(1.0/256.0) - (1.0/512.0);
            float y8 = (j+5.0)*(1.0/256.0) - (1.0/512.0);
            float x9 = (i+5.0)*(1.0/256.0) - (1.0/512.0);
            float y9 = (j+5.0)*(1.0/256.0) - (1.0/512.0); 

            v1 = v;
            v2 = sampleAs3DTexture(vec3(x6, y6, z));
            v3 = sampleAs3DTexture(vec3(x8, y8, z));
            v4 = sampleAs3DTexture(vec3(x9, y9, z));

            a1 = (x-x5)/(x6-x5);
            a2 = (y-y5)/(y8-y5);

            temV1 = mix(v1, v2, a1);
            temV2 = mix(v3, v4, a2);

            interV = vec4(1.0, 0.0, 0.0, 1.0);//mix(temV1, temV2, a2);
        }else
        {
            interV = sampleAs3DTexture(vec3(x5, y5, z));
        }

        return interV;
    }

    void main( void ) {
        vec4 locPos = invMat_2 * worldPos;
        vec4 locViewerPositionWC = invMat_2 * vec4(czm_viewerPositionWC, 1.0);
        vec3 dir = locPos.xyz - locViewerPositionWC.xyz; 

        vec3 boxsize = vec3(boxLon_3, boxLat_4, boxHeight_5);

        float delta = 1.0 / steps;

        vec3 deltaDirection = normalize(dir / boxsize) * delta;
        float deltaDirectionLength = length(deltaDirection);

        vec3 currentPosition = locPos.xyz / boxsize;
     
        vec4 accumulatedColor = vec4(0.0);
        float accumulatedAlpha = 0.0;
        
        //float accumulatedLength = 0.0;
        
        vec4 colorSample;
        float alphaSample;
    #define TEST 0

    #if TEST
        gl_FragColor = sampleAs3DTexture( currentPosition );

    #else


        for(int i = 0; i < MAX_STEPS; i++)
        {
            //Get the voxel intensity value from the 3D texture.    
            colorSample = sampleAs3DTexture( currentPosition );

            // vec3 currentPosition1 = vec3(max(0.0, currentPosition.x-(2.0/256.0)), max(0.0, currentPosition.y-(2.0/256.0)), currentPosition.z );
            // vec4 a1 = sampleAs3DTexture( currentPosition1 );

            // vec3 currentPosition2 = vec3(max(0.0, currentPosition.x-(2.0/256.0)), min(1.0, currentPosition.y+(2.0/256.0)), currentPosition.z );
            // vec4 a2 = sampleAs3DTexture( currentPosition2 );

            // vec3 currentPosition3 = vec3(min(1.0, currentPosition.x+(2.0/256.0)), max(0.0, currentPosition.y-(2.0/256.0)), currentPosition.z );
            // vec4 a3 = sampleAs3DTexture( currentPosition3 );

            // vec3 currentPosition4 = vec3(min(1.0, currentPosition.x+(2.0/256.0)), min(1.0, currentPosition.y+(2.0/256.0)), currentPosition.z );
            // vec4 a4 = sampleAs3DTexture( currentPosition4 );

            // vec3 currentPosition5 = vec3(max(0.0, currentPosition.x-(2.0/256.0)), currentPosition.y, currentPosition.z );
            // vec4 a5 = sampleAs3DTexture( currentPosition5 );

            // vec3 currentPosition6 = vec3(currentPosition.x, min(1.0, currentPosition.y+(2.0/256.0)), currentPosition.z );
            // vec4 a6 = sampleAs3DTexture( currentPosition6 );

            // vec3 currentPosition7 = vec3(currentPosition.x, max(0.0, currentPosition.y-(2.0/256.0)), currentPosition.z );
            // vec4 a7 = sampleAs3DTexture( currentPosition7 );

            // vec3 currentPosition8 = vec3(min(1.0, currentPosition.x+(2.0/256.0)), currentPosition.y, currentPosition.z );
            // vec4 a8 = sampleAs3DTexture( currentPosition8 );

            // colorSample = (( a1+a2+a3+a4)/1.41+a5+a6+a7+a8)/8.0;

            //////////////////////////////////////////////////////////////////////////
            float k,b,x;

            if(line_12[0][2] != 0.0)
            {
                k = (float(line_12[0][3]) - float(line_12[0][1]))/(float(line_12[0][2]) - float(line_12[0][0]));
                b = float(line_12[0][3]) - k * float(line_12[0][2]); 
            }

            if(line_12[1][0] != 0.0)
            {
                k = (float(line_12[1][1]) - float(line_12[0][3]))/(float(line_12[1][0]) - float(line_12[0][2]));
                b = float(line_12[1][1]) - k * float(line_12[1][0]); 
            } 

            if(line_12[1][2] != 0.0)
            {
                k = (float(line_12[1][3]) - float(line_12[1][1]))/(float(line_12[1][2]) - float(line_12[1][0]));
                b = float(line_12[1][3]) - k * float(line_12[1][2]);  
            }

            if(line_12[2][0] != 0.0)
            {
                k = (float(line_12[2][1]) - float(line_12[1][3]))/(float(line_12[2][0]) - float(line_12[1][2]));
                b = float(line_12[2][1]) - k * float(line_12[2][0]);  
            }

            if(line_12[2][2] != 0.0)
            {
                k = (float(line_12[2][3]) - float(line_12[2][1]))/(float(line_12[2][2]) - float(line_12[2][0]));
                b = float(line_12[2][3]) - k * float(line_12[2][2]);  
            }

            if(line_12[3][0] != 0.0)
            {
                k = (float(line_12[3][1]) - float(line_12[2][3]))/(float(line_12[3][0]) - float(line_12[2][2]));
                b = float(line_12[3][1]) - k * float(line_12[3][0]);  
            }

            if(line_12[3][2] != 0.0 )
            {
                k = (float(line_12[3][3]) - float(line_12[3][1]))/(float(line_12[3][2]) - float(line_12[3][0]));
                b = float(line_12[3][3]) - k * float(line_12[3][2]);  
            }

            x = colorSample.a;
            colorSample.a = (k * x + b) / 255.0;
           

            if(currentPosition.x < minLongitude_7/boxLon_3) colorSample = vec4(0.0, 0.0, 0.0, 0.0);
            if(currentPosition.y < minLatitude_8/boxLat_4) colorSample = vec4(0.0, 0.0, 0.0, 0.0);
            if(currentPosition.z < minHeight_6/boxHeight_5) colorSample = vec4(0.0, 0.0, 0.0, 0.0);
            if(currentPosition.x > maxLongitude_10/boxLon_3) colorSample = vec4(0.0, 0.0, 0.0, 0.0);
            if(currentPosition.y > maxLatitude_11/boxLat_4) colorSample = vec4(0.0, 0.0, 0.0, 0.0);
            if(currentPosition.z > maxHeight_9/boxHeight_5) colorSample = vec4(0.0, 0.0, 0.0, 0.0);                 

            
            #if 0
                accumulatedColor.rgb = accumulatedColor.rgb * (accumulatedAlpha) + colorSample.rgb * (1.0 - accumulatedAlpha);
                accumulatedAlpha = accumulatedAlpha + colorSample.a - accumulatedAlpha * colorSample.a;
            #else
            //Allow the alpha correction customization
            alphaSample = colorSample.a * alphaCorrection;

            //Perform the composition.
            accumulatedColor += (1.0 - accumulatedAlpha) * colorSample * alphaSample;
            
            //Store the alpha accumulated so far.
            accumulatedAlpha += (1.0 - accumulatedAlpha) * alphaSample;
            #endif
            
            //Advance the ray.
            currentPosition += deltaDirection;
                      
            //If the length traversed is more than the ray length, or if the alpha accumulated reaches 1.0 then exit.
            if(accumulatedAlpha > 1.0 )
               break;

            if(currentPosition.x > 1.0) break;
            if(currentPosition.y > 1.0) break;
            if(currentPosition.z > 1.0) break;
            if(currentPosition.x < 0.0) break;
            if(currentPosition.y < 0.0) break;
            if(currentPosition.z < 0.0) break;
        }

        //vec3 normal =  normalize(normall_13);
        // vec3 light = vec3(1.0,1.0,1.0);
        //vec3 ambientlight = vec3(1.0,1.0,1.0);     
        //vec3 lightDir = normalize(worldPos.xyz);
        //float nDotL = max(dot(lightDir, normal),0.0);
        //vec3 diffuse = light * accumulatedColor.rgb * nDotL;
        //vec3 ambient = ambientlight * accumulatedColor.rgb;
        //gl_FragColor  = vec4(diffuse + ambient, accumulatedAlpha);

        gl_FragColor  = vec4(accumulatedColor.rgb, accumulatedAlpha);
    #endif
    }              
    
    `,
    vertexShaderPass: `
    varying vec4 worldPos;
    
    attribute float batchId;
    attribute vec3 position3DHigh;
    attribute vec3 position3DLow;
    //uniform vec3 uNormal;
    //varying vec3 v_normal;

    vec4 czm_translateRelativeToEye2(vec3 high, vec3 low)    
    {
        vec3 highDifference = high - czm_encodedCameraPositionMCHigh;
        vec3 lowDifference = low - czm_encodedCameraPositionMCLow;
        return vec4(highDifference + lowDifference, 1.0);
    }

    void main()
    {
        //v_normal =  normalize(czm_normal * normall_13);
        //v_normal =  normall_13;

        vec4 p = czm_translateRelativeToEye2(position3DHigh, position3DLow);
        gl_Position = czm_modelViewProjectionRelativeToEye * p;   

        vec3 pos = position3DHigh + position3DLow;
        //czm_model
        //一种GLSL一致变量 表示4x4模型变换矩阵，可将模型坐标转换为世界坐标。
        worldPos = czm_model * vec4(pos, 1.0);
    }    
    `,
    fragmentShaderPass: `
        varying vec4 worldPos;

        const int MAX_STEPS = 256;
        const float steps = 256.0;
        const float alphaCorrection  = 0.10;
        const float zDataSliceNumber = 63.0;

        //varying vec3 v_normal;

        // Z方向256层体数据变为64层体数据
        vec4 sampleAs3DTexture( vec3 texCoord )
        {
            vec4 colorSlice1, colorSlice2;
            vec2 texCoordSlice1, texCoordSlice2;
            
            //The z coordinate determines which Z slice we have to look for.
            //Z slice number goes from 0 to 255.
            float zSliceNumber1 = floor(texCoord.z  * zDataSliceNumber);
            
            //As we use trilinear we go the next Z slice.
            float zSliceNumber2 = min( zSliceNumber1 + 1.0, zDataSliceNumber); //Clamp to 255
            
            //The Z slices are stored in a matrix of 16x16 of Z slices.
            //The original UV coordinates have to be rescaled by the tile numbers in each row and column.
            texCoord.xy /= 8.0;

            texCoordSlice1 = texCoordSlice2 = texCoord.xy;
                                        
            //Add an offset to the original UV coordinates depending on the row and column number.
            texCoordSlice1.x += (mod(zSliceNumber1, 8.0 ) / 8.0);
            texCoordSlice1.y += floor((zDataSliceNumber - zSliceNumber1) / 8.0) / 8.0;
                
            texCoordSlice2.x += (mod(zSliceNumber2, 8.0 ) / 8.0);
            texCoordSlice2.y += floor((zDataSliceNumber - zSliceNumber2) / 8.0) / 8.0;
            
            //Get the opacity value from the 2D texture.
            //Bilinear filtering is done at each texture2D by default.
            colorSlice1 = texture2D( cubeTex_0, texCoordSlice1 );
            colorSlice2 = texture2D( cubeTex_0, texCoordSlice2 );

            
            //Based on the opacity obtained earlier, get the RGB color in the transfer function texture.
            colorSlice1.rgb = texture2D( transferTex_1, vec2(colorSlice1.a, 1.0) ).rgb;
            colorSlice2.rgb = texture2D( transferTex_1, vec2(colorSlice2.a, 1.0) ).rgb;
            
            //How distant is zSlice1 to ZSlice2. Used to interpolate between one Z slice and the other.
            float zDifference = mod(texCoord.z * zDataSliceNumber, 1.0);

            //Finally interpolate between the two intermediate colors of each Z slice.
            return mix(colorSlice1, colorSlice2, zDifference);

            //float weight = abs(zSliceNumber2 / 64.0 - texCoord.z);
            //return mix(colorSlice1, colorSlice2, weight);
        } 

       

        /// 主函数
        void main( void ) {

            vec4 locPos = invMat_2 * worldPos;
            //czm_viewerPositionWC
            // 一种GLSL一致变量，表示观察者（相机）在世界坐标中的位置。
            vec4 locViewerPositionWC = invMat_2 * vec4(czm_viewerPositionWC, 1.0);
            vec3 dir = locPos.xyz - locViewerPositionWC.xyz; 

            vec3 boxsize = vec3(boxLon_3, boxLat_4, boxHeight_5);

            float delta = 1.0 / steps;

            vec3 deltaDirection = normalize(dir / boxsize) * delta;
            float deltaDirectionLength = length(deltaDirection);

            vec3 currentPosition = locPos.xyz / boxsize;
         
            vec4 accumulatedColor = vec4(0.0);
            float accumulatedAlpha = 0.0;
            
            vec4 colorSample;
            float alphaSample;
#define TEST 0

#if TEST
            gl_FragColor = sampleAs3DTexture( currentPosition );
#else 

            for(int i = 0; i < MAX_STEPS; i++)
            {
                //Get the voxel intensity value from the 3D texture.    
                colorSample = sampleAs3DTexture( currentPosition );
                //colorSample = sampletexture( currentPosition , deltaDirectionLength )

                if(currentPosition.x < minLongitude_7/boxLon_3) colorSample = vec4(0.0, 0.0, 0.0, 0.0);
                if(currentPosition.y < minLatitude_8/boxLat_4) colorSample = vec4(0.0, 0.0, 0.0, 0.0);
                if(currentPosition.z < minHeight_6/boxHeight_5) colorSample = vec4(0.0, 0.0, 0.0, 0.0);
                if(currentPosition.x > maxLongitude_10/boxLon_3) colorSample = vec4(0.0, 0.0, 0.0, 0.0);
                if(currentPosition.y > maxLatitude_11/boxLat_4) colorSample = vec4(0.0, 0.0, 0.0, 0.0);
                if(currentPosition.z > maxHeight_9/boxHeight_5) colorSample = vec4(0.0, 0.0, 0.0, 0.0);                 

                //colorSample.a = colorSample.a * 1.0;
                #if 0
                    accumulatedColor.rgb = accumulatedColor.rgb * (accumulatedAlpha) + colorSample.rgb * (1.0 - accumulatedAlpha);
                    accumulatedAlpha = accumulatedAlpha + colorSample.a - accumulatedAlpha * colorSample.a;
                #else
                //Allow the alpha correction customization
                alphaSample = colorSample.a * alphaCorrection;

                //Perform the composition.
                accumulatedColor += (1.0 - accumulatedAlpha) * colorSample * alphaSample;
                
                //Store the alpha accumulated so far.
                accumulatedAlpha += (1.0 - accumulatedAlpha) * alphaSample;
                #endif
                
                //Advance the ray.
                currentPosition += deltaDirection;
                //accumulatedLength += deltaDirectionLength;
                          
                //If the length traversed is more than the ray length, or if the alpha accumulated reaches 1.0 then exit.
                if(accumulatedAlpha > 1.0 )
                   break;

                if(currentPosition.x > 1.0) break;
                if(currentPosition.y > 1.0) break;
                if(currentPosition.z > 1.0) break;
                if(currentPosition.x < 0.0) break;
                if(currentPosition.y < 0.0) break;
                if(currentPosition.z < 0.0) break;
            }

            //ec3 normal =  normalize(czm_normal * v_normal); 
            vec3 normal =  czm_normal * normall_13;
            vec3 lightcolor = vec3(1.0,1.0,1.0);
            vec3 ambientlight = vec3(1.0,1.0,1.0); 
            vec3 position = vec3(100.0,0.0,2000.0); 
            vec3 lightDir = normalize(worldPos.xyz);
            float nDotL = max(dot(lightDir, normal),0.0);
            vec3 diffuse = lightcolor * accumulatedColor.rgb * nDotL;
            vec3 ambient = ambientlight * accumulatedColor.rgb;
            gl_FragColor  = vec4(diffuse + ambient, accumulatedAlpha);

            //gl_FragColor  = vec4(accumulatedColor.rgb, accumulatedAlpha);
#endif
        }                             
    `,
    sliceVertexShaderPass: `
    varying vec4 worldPos;
    
    attribute float batchId;
    attribute vec3 position3DHigh;
    attribute vec3 position3DLow;

    vec4 czm_translateRelativeToEye2(vec3 high, vec3 low)
    {
        vec3 highDifference = high - czm_encodedCameraPositionMCHigh;
        vec3 lowDifference = low - czm_encodedCameraPositionMCLow;
        return vec4(highDifference + lowDifference, 1.0);
    }

    void main()
    {
        vec4 p = czm_translateRelativeToEye2(position3DHigh, position3DLow);
        gl_Position = czm_modelViewProjectionRelativeToEye * p;

        vec3 pos = position3DHigh + position3DLow;
        worldPos = czm_model * vec4(pos, 1.0);
    }
    `,
    sliceFragmentShaderPass: `
    varying vec4 worldPos;

    const int MAX_STEPS = 256;
    const float zDataSliceNumber = 63.0;

    // Z方向-256层体数据变为64层体数据
    vec4 sampleAs3DTexture( vec3 texCoord )
    {
        vec4 colorSlice1, colorSlice2;
        vec2 texCoordSlice1, texCoordSlice2;
        
        //The z coordinate determines which Z slice we have to look for.
        //Z slice number goes from 0 to 255.
        float zSliceNumber1 = floor(texCoord.z  * zDataSliceNumber);
        
        //As we use trilinear we go the next Z slice.
        float zSliceNumber2 = min( zSliceNumber1 + 1.0, zDataSliceNumber); //Clamp to 255
        
        //The Z slices are stored in a matrix of 16x16 of Z slices.
        //The original UV coordinates have to be rescaled by the tile numbers in each row and column.
        texCoord.xy /= 8.0;

        texCoordSlice1 = texCoordSlice2 = texCoord.xy;
                                    
        //Add an offset to the original UV coordinates depending on the row and column number.
        texCoordSlice1.x += (mod(zSliceNumber1, 8.0 ) / 8.0);
        texCoordSlice1.y += floor((zDataSliceNumber - zSliceNumber1) / 8.0) / 8.0;
            
        texCoordSlice2.x += (mod(zSliceNumber2, 8.0 ) / 8.0);
        texCoordSlice2.y += floor((zDataSliceNumber - zSliceNumber2) / 8.0) / 8.0;
        
        //Get the opacity value from the 2D texture.
        //Bilinear filtering is done at each texture2D by default.
        colorSlice1 = texture2D( cubeTex_0, texCoordSlice1 );
        colorSlice2 = texture2D( cubeTex_0, texCoordSlice2 );

        //Based on the opacity obtained earlier, get the RGB color in the transfer function texture.
        colorSlice1.rgb = texture2D( transferTex_1, vec2(colorSlice1.a, 1.0) ).rgb;
        colorSlice2.rgb = texture2D( transferTex_1, vec2(colorSlice2.a, 1.0) ).rgb;
        
        //How distant is zSlice1 to ZSlice2. Used to interpolate between one Z slice and the other.
        float zDifference = mod(texCoord.z * zDataSliceNumber, 1.0);

        //Finally interpolate between the two intermediate colors of each Z slice.
        return mix(colorSlice1, colorSlice2, zDifference);
    }

    void main( void ) {
        vec4 locPos = invMat_2 * worldPos;
        
        vec4 colorSample;
        float accumulatedAlpha = 0.0;

        #define TEST 0

        #if TEST
            gl_FragColor = sampleAs3DTexture( vec3(locPos.x/boxLong_3, locPos.y/boxWidth_4, locPos.z/boxHeight_5) );

        #else

        colorSample  = sampleAs3DTexture(vec3(locPos.x/boxLong_3, locPos.y/boxWidth_4, locPos.z/boxHeight_5));
    
        float k,b,x;

            if(line_6[0][2] != 0.0)
            {
                k = (float(line_6[0][3]) - float(line_6[0][1]))/(float(line_6[0][2]) - float(line_6[0][0]));
                b = float(line_6[0][3]) - k * float(line_6[0][2]); 
            }

            if(line_6[1][0] != 0.0)
            {
                k = (float(line_6[1][1]) - float(line_6[0][3]))/(float(line_6[1][0]) - float(line_6[0][2]));
                b = float(line_6[1][1]) - k * float(line_6[1][0]); 
            } 

            if(line_6[1][2] != 0.0)
            {
                k = (float(line_6[1][3]) - float(line_6[1][1]))/(float(line_6[1][2]) - float(line_6[1][0]));
                b = float(line_6[1][3]) - k * float(line_6[1][2]);  
            }

            if(line_6[2][0] != 0.0)
            {
                k = (float(line_6[2][1]) - float(line_6[1][3]))/(float(line_6[2][0]) - float(line_6[1][2]));
                b = float(line_6[2][1]) - k * float(line_6[2][0]);  
            }

            if(line_6[2][2] != 0.0)
            {
                k = (float(line_6[2][3]) - float(line_6[2][1]))/(float(line_6[2][2]) - float(line_6[2][0]));
                b = float(line_6[2][3]) - k * float(line_6[2][2]);  
            }

            if(line_6[3][0] != 0.0)
            {
                k = (float(line_6[3][1]) - float(line_6[2][3]))/(float(line_6[3][0]) - float(line_6[2][2]));
                b = float(line_6[3][1]) - k * float(line_6[3][0]);  
            }

            if(line_6[3][2] != 0.0)
            {
                k = (float(line_6[3][3]) - float(line_6[3][1]))/(float(line_6[3][2]) - float(line_6[3][0]));
                b = float(line_6[3][3]) - k * float(line_6[3][2]);  
            }

            x = colorSample.a;
            colorSample.a = (k * x + b) / 255.0;

            colorSample.rgb = colorSample.rgb * (1.0 - accumulatedAlpha);
            accumulatedAlpha = accumulatedAlpha + colorSample.a - accumulatedAlpha * colorSample.a;
            
            if(accumulatedAlpha != 0.0 )
            {
                accumulatedAlpha = 1.0;
            }
            
            gl_FragColor  = vec4(colorSample.rgb, accumulatedAlpha);

        #endif
    }    
    `
}

/**
 * 体数据绘制曲面shader
 * @type {{}}
 */
const GLSL_VOLUME_SURFACE = {
    filterVertexShaderPass: `
    varying vec4 worldPos;

    attribute float batchId;
    attribute vec3 position3DHigh;
    attribute vec3 position3DLow;

    vec4 czm_translateRelativeToEye2(vec3 high, vec3 low)
    {
        vec3 highDifference = high - czm_encodedCameraPositionMCHigh;
        vec3 lowDifference = low - czm_encodedCameraPositionMCLow;
        return vec4(highDifference + lowDifference, 1.0);
    }

    void main()
    {
        vec4 p = czm_translateRelativeToEye2(position3DHigh, position3DLow);
        gl_Position = czm_modelViewProjectionRelativeToEye * p;

        vec3 pos = position3DHigh + position3DLow;
        worldPos = czm_model * vec4(pos, 1.0);
    }
    `,
    filterFragmentShaderPass: `
    #line 0
    varying vec4 worldPos;

    const int MAX_STEPS = 200;
    const float steps = 200.0;
    const float alphaCorrection = 0.50;
    const float zDataSliceNumber = 63.0;

    vec3 mintex = vec3(texmin_6.x, texmin_6.y, texmin_6.z);
    vec3 maxtex = vec3(texmax_7.x, texmax_7.y, texmax_7.z);
    
    /// 切片列数
    const int SliceNumX = 8;
    /// 切片行数
    const int SliceNumY = 8;
    /// 总切片数
    const int SliceCount = SliceNumY * SliceNumX;

    /// 
    const float SliceNumXf = float(SliceNumX);
    const float SliceNumYf = float(SliceNumY);
    const float SliceCountf = float(SliceCount);

    /// 切片的宽高
    const float SliceWidth  = 1.0 / SliceNumXf;
    const float SliceHeight = 1.0 / SliceNumYf;
    
    vec2 points[8];
    void initPoints()
    {
        points[0] = vec2(line_9[0][0],line_9[0][1]);
        points[1] = vec2(line_9[0][2],line_9[0][3]);
        points[2] = vec2(line_9[1][0],line_9[1][1]);
        points[3] = vec2(line_9[1][2],line_9[1][3]);
        points[4] = vec2(line_9[2][0],line_9[2][1]);
        points[5] = vec2(line_9[2][2],line_9[2][3]);
        points[6] = vec2(line_9[3][0],line_9[3][1]);
        points[7] = vec2(line_9[3][2],line_9[3][3]);
    }

    // Z方向-256层体数据变为64层体数据
    vec4 sampleAs3DTexture( vec3 texCoord )
    {
        /// 大于等于1
        if (any(greaterThanEqual(texCoord, maxtex))) return vec4(0);
        /// 小于0
        if (any(lessThan(texCoord, mintex))) return vec4(0);


        /// 计算在第几个切片，加0.5便于计算
        float slice = texCoord.z * SliceCountf + 0.5;
        float slice_int = floor(slice);
        float slice_dot = slice - slice_int;

        ///
        float slice_n1 = slice_int - 1.0, slice_n2 = slice_int;
        if (slice_int == 0.0) slice_n1 = 0.0;
        if (slice_int == SliceCountf) slice_n2 = SliceCountf - 1.0;

        /// 
        //texCoord.y = 1.0 - texCoord.y;

        //The Z slices are stored in a matrix of 16x16 of Z slices.
        //The original UV coordinates have to be rescaled by the tile numbers in each row and column.
        texCoord.x /= float(SliceNumX);
        texCoord.y /= float(SliceNumY);

        ///
        vec2 texcoord1 = texCoord.xy;
        vec2 texcoord2 = texCoord.xy;
        //Add an offset to the original UV coordinates depending on the row and column number.
        texcoord1.x += mod(slice_n1, SliceNumXf) * SliceWidth;
        texcoord1.y += (SliceNumYf - floor(slice_n1 / SliceNumXf) - 1.0) * SliceHeight;

        texcoord2.x += mod(slice_n2, SliceNumXf) * SliceWidth;
        texcoord2.y += (SliceNumYf - floor(slice_n2 / SliceNumXf) - 1.0) * SliceHeight;

        //texcoord1.y = 1.0 - texcoord1.y;
        //texcoord2.y = 1.0 - texcoord2.y;

        /// 分别在两个切片上进行纹理采样
        vec4 color1 = texture2D( cubeTex_0, texcoord1 );
        vec4 color2 = texture2D( cubeTex_0, texcoord2 );

        /// 混合颜色
        vec4 colormix = mix(color1, color2, slice_dot);
        //vec4 colormix = color1;

        /// 对色表进行采样
        colormix.rgb = texture2D(transferTex_1, vec2(colormix.a, 1.0)).rgb;

        ///
        return colormix;
    }

    //cesium.js中世界坐标转经纬度坐标算法移植
    vec3 xyz2lnlt( float x, float y, float z)
    {
        vec3 oneOverRadii = vec3(1.0 / 6378137.0, 1.0 / 6378137.0, 1.0 / 6356752.3142451793);
        vec3 oneOverRadiiSquared = vec3(1.0 / (6378137.0 * 6378137.0), 1.0 / (6378137.0 * 6378137.0), 1.0 / (6356752.3142451793 * 6356752.3142451793));
        float centerToleranceSquared = 0.1;

        vec3 p,n,h;
        //第一步：缩放至标准椭球表面
        float squaredNorm = x * x * oneOverRadii.x * oneOverRadii.x +  y * y * oneOverRadii.y * oneOverRadii.y + z * z * oneOverRadii.z * oneOverRadii.z;
        float ratio = sqrt(1.0 / squaredNorm);
        vec3 intersection = vec3(x, y, z) * ratio;
        p = intersection;

        // //第二步：
        // //归一化,计算高程参数h
        n.x = p.x * oneOverRadiiSquared.x;
        n.y = p.y * oneOverRadiiSquared.y;
        n.z = p.z * oneOverRadiiSquared.z;
        vec3 normal = normalize(n);

        h.x = x - p.x;
        h.y = y - p.y;
        h.z = z - p.z;

        float L = degrees(atan(normal.y,normal.x));
        float B  =degrees(asin(normal.z));
        float H = sign(h.x * x + h.y * y + h.z * z) * sqrt(h.x * h.x + h.y * h.y + h.z * h.z);

        return vec3(L, B, H);
    }
    
    void main( void ) {

        initPoints();

        vec3 dir = worldPos.xyz - czm_viewerPositionWC.xyz ; 
        float delta = recDiagonal_8 * 2.0 / steps;
        vec3 deltaDirection = normalize(dir) * delta;
    
        vec3 currentPosition = worldPos.xyz;
        
        vec4 accumulatedColor = vec4(0.0);
        float accumulatedAlpha = 0.0;
        
        vec4 colorSample;
        float alphaSample;
    #define TEST 0

    #if TEST
        gl_FragColor = sampleAs3DTexture( currentPosition );

    #else
        for(int i = 0; i < MAX_STEPS; i++)
        {
            vec3 geo = xyz2lnlt(currentPosition.x, currentPosition.y, currentPosition.z);
            geo.x = (geo.x - boxmin_4.x) / box_3.x;
            geo.y = (geo.y - boxmin_4.y) / box_3.y;
            geo.z = (geo.z - boxmin_4.z) / box_3.z;

            //Get the voxel intensity value from the 3D texture.    
            colorSample = sampleAs3DTexture( geo );
        

            //////////////////////////////////////////////////////////////////////////
            float k,b,x;

            x = colorSample.a;
            vec2 point0 = points[0];
            for(int i = 1;i < 8;i++){
                vec2 point1 = points[i];
                if(x < point1.x){
                    k = (point1.y - point0.y) / (point1.x - point0.x);
                    b = point1.y - k * point1.x;
                    colorSample.a = k * x + b;
                    break;
                }
                point0 = point1;
            }
            
            #if 0
                accumulatedColor.rgb = accumulatedColor.rgb * (accumulatedAlpha) + colorSample.rgb * (1.0 - accumulatedAlpha);
                accumulatedAlpha = accumulatedAlpha + colorSample.a - accumulatedAlpha * colorSample.a;
            #else
            //Allow the alpha correction customization
            alphaSample = colorSample.a * alphaCorrection;

            //Perform the composition.
            accumulatedColor += (1.0 - accumulatedAlpha) * colorSample * alphaSample;
            
            //Store the alpha accumulated so far.
            accumulatedAlpha += (1.0 - accumulatedAlpha) * alphaSample;
            #endif
            
            //Advance the ray.
            currentPosition += deltaDirection;
                      
            //If the length traversed is more than the ray length, or if the alpha accumulated reaches 1.0 then exit.
            if(accumulatedAlpha > 1.0 )break;

        }

        gl_FragColor  = vec4(accumulatedColor.rgb, accumulatedAlpha);
    #endif
    }             
    `,
    vertexShaderPass: `
varying vec4 worldPos;

attribute float batchId;
attribute vec3 position3DHigh;
attribute vec3 position3DLow;

vec4 czm_translateRelativeToEye2(vec3 high, vec3 low)
{
  vec3 highDifference = high - czm_encodedCameraPositionMCHigh;
  vec3 lowDifference = low - czm_encodedCameraPositionMCLow;
  return vec4(highDifference + lowDifference, 1.0);
}

void main()
{
  vec4 p = czm_translateRelativeToEye2(position3DHigh, position3DLow);

  //vec4 p = czm_computePosition();
  gl_Position = czm_modelViewProjectionRelativeToEye * p;

  vec3 pos = position3DHigh + position3DLow;
  //czm_model
  //一种GLSL一致变量 表示4x4模型变换矩阵，可将模型坐标转换为世界坐标。
  worldPos = czm_model * vec4(pos, 1.0);
}

    `,
    fragmentShaderPass: `
    varying vec4 worldPos;

const int MAX_STEPS = 200;
const float steps = 200.0;
const float alphaCorrection  = 0.50;
const float zDataSliceNumber = 63.0;

vec3 mintex = vec3(texmin_6.x, texmin_6.y, texmin_6.z);
vec3 maxtex = vec3(texmax_7.x, texmax_7.y, texmax_7.z);

/// 切片列数
const int SliceNumX = 8;
/// 切片行数
const int SliceNumY = 8;
/// 总切片数
const int SliceCount = SliceNumY * SliceNumX;

/// 
const float SliceNumXf = float(SliceNumX);
const float SliceNumYf = float(SliceNumY);
const float SliceCountf = float(SliceCount);

/// 切片的宽高
const float SliceWidth  = 1.0 / SliceNumXf;
const float SliceHeight = 1.0 / SliceNumYf;

// Z方向256层体数据变为64层体数据
vec4 sampleAs3DTexture( vec3 texCoord )
{
    /// 大于等于1
    if (any(greaterThanEqual(texCoord, maxtex))) return vec4(0);
    /// 小于0
    if (any(lessThan(texCoord, mintex))) return vec4(0);


    /// 计算在第几个切片，加0.5便于计算
    float slice = texCoord.z * SliceCountf + 0.5;
    float slice_int = floor(slice);
    float slice_dot = slice - slice_int;

    ///
    float slice_n1 = slice_int - 1.0, slice_n2 = slice_int;
    if (slice_int == 0.0) slice_n1 = 0.0;
    if (slice_int == SliceCountf) slice_n2 = SliceCountf - 1.0;

    /// 
    //texCoord.y = 1.0 - texCoord.y;

    //The Z slices are stored in a matrix of 16x16 of Z slices.
    //The original UV coordinates have to be rescaled by the tile numbers in each row and column.
    texCoord.x /= float(SliceNumX);
    texCoord.y /= float(SliceNumY);

    ///
    vec2 texcoord1 = texCoord.xy;
    vec2 texcoord2 = texCoord.xy;
    //Add an offset to the original UV coordinates depending on the row and column number.
    texcoord1.x += mod(slice_n1, SliceNumXf) * SliceWidth;
    texcoord1.y += (SliceNumYf - floor(slice_n1 / SliceNumXf) - 1.0) * SliceHeight;

    texcoord2.x += mod(slice_n2, SliceNumXf) * SliceWidth;
    texcoord2.y += (SliceNumYf - floor(slice_n2 / SliceNumXf) - 1.0) * SliceHeight;

    //texcoord1.y = 1.0 - texcoord1.y;
    //texcoord2.y = 1.0 - texcoord2.y;

    /// 分别在两个切片上进行纹理采样
    vec4 color1 = texture2D( cubeTex_0, texcoord1 );
    vec4 color2 = texture2D( cubeTex_0, texcoord2 );

    /// 混合颜色
    vec4 colormix = mix(color1, color2, slice_dot);
    //vec4 colormix = color1;

    /// 对色表进行采样
    colormix.rgb = texture2D(transferTex_1, vec2(colormix.a, 1.0)).rgb;

    ///
    return colormix;
} 

//cesium.js中笛卡尔坐标转经纬度坐标算法移植
vec3 xyz2lnlt( float x, float y, float z)
{
    vec3 oneOverRadii = vec3(1.0 / 6378137.0, 1.0 / 6378137.0, 1.0 / 6356752.3142451793);
    vec3 oneOverRadiiSquared = vec3(1.0 / (6378137.0 * 6378137.0), 1.0 / (6378137.0 * 6378137.0), 1.0 / (6356752.3142451793 * 6356752.3142451793));
    float centerToleranceSquared = 0.1;

    vec3 p,n,h;
    //第一步：缩放至标准椭球表面
    float squaredNorm = x * x * oneOverRadii.x * oneOverRadii.x +  y * y * oneOverRadii.y * oneOverRadii.y + z * z * oneOverRadii.z * oneOverRadii.z;
    float ratio = sqrt(1.0 / squaredNorm);
    vec3 intersection = vec3(x, y, z) * ratio;
    p = intersection;

    // //第二步：
    // //归一化,计算高程参数h
    n.x = p.x * oneOverRadiiSquared.x;
    n.y = p.y * oneOverRadiiSquared.y;
    n.z = p.z * oneOverRadiiSquared.z;
    vec3 normal = normalize(n);

    h.x = x - p.x;
    h.y = y - p.y;
    h.z = z - p.z;

    float L = degrees(atan(normal.y,normal.x));
    float B  =degrees(asin(normal.z));
    float H = sign(h.x * x + h.y * y + h.z * z) * sqrt(h.x * h.x + h.y * h.y + h.z * h.z);

    return vec3(L, B, H);
}

//公式法：笛卡尔坐标转经纬度坐标
// vec3 xyz2lnlt( float x, float y, float z)
//     {
//         float Lr = atan(y, x);
//         float c = sqrt(x * x + y * y + z * z);
//         float Br = asin(z / c);
//         float lon = degrees(Lr);
//         float lat = degrees(Br);
//         return vec3(lon, lat, c - 6378137.0);
//     }

/// 主函数 
void main( void ) { 
    vec3 dir = worldPos.xyz - czm_viewerPositionWC.xyz ; 
    float delta = recDiagonal_8 * 2.0 / steps;
    vec3 deltaDirection = normalize(dir) * delta;

    vec3 currentPosition = worldPos.xyz;
    
    vec4 accumulatedColor = vec4(0.0);
    float accumulatedAlpha = 0.0;
    
    vec4 colorSample;
    float alphaSample;


    for(int i = 0; i < MAX_STEPS; ++i)
    {
        vec3 geo = xyz2lnlt(currentPosition.x, currentPosition.y, currentPosition.z);

        geo.x = (geo.x - boxmin_4.x) / box_3.x;
        geo.y = (geo.y - boxmin_4.y) / box_3.y;
        geo.z = (geo.z - boxmin_4.z) / box_3.z;

        //Get the voxel intensity value from the 3D texture.    
        colorSample = sampleAs3DTexture( geo );

        #if 0
            //accumulatedColor.rgb = accumulatedColor.rgb * (accumulatedAlpha) + colorSample.rgb * (1.0 - accumulatedAlpha);
            //accumulatedAlpha = accumulatedAlpha + colorSample.a - accumulatedAlpha * colorSample.a;
            accumulatedColor.rgb = colorSample.rgb;
        #else
            //Allow the alpha correction customization
            alphaSample = colorSample.a * alphaCorrection;

            //Perform the composition.
            accumulatedColor += (1.0 - accumulatedAlpha) * colorSample * alphaSample;
            
            //Store the alpha accumulated so far.
            accumulatedAlpha += (1.0 - accumulatedAlpha) * alphaSample;
        #endif
        
        //Advance the ray.
        currentPosition += deltaDirection;
        //accumulatedLength += deltaDirectionLength;
                    
        //If the length traversed is more than the ray length, or if the alpha accumulated reaches 1.0 then exit.
        if(accumulatedAlpha > 1.0 )break;
    }

    //float v = float(c) / 256.0;
    //gl_FragColor  = vec4(v,v,v,1.0); 
    gl_FragColor = vec4(accumulatedColor.rgb, accumulatedAlpha);
    //gl_FragColor = vec4(accumulatedColor.rgb, 1.0);
}        
    `,
    materialShader: '',
    sliceVertexShaderPass: `
    varying vec4 worldPos;
    
    attribute float batchId;
    attribute vec3 position3DHigh;
    attribute vec3 position3DLow;

    vec4 czm_translateRelativeToEye2(vec3 high, vec3 low)
    {
        vec3 highDifference = high - czm_encodedCameraPositionMCHigh;
        vec3 lowDifference = low - czm_encodedCameraPositionMCLow;
        return vec4(highDifference + lowDifference, 1.0);
    }

    void main()
    {
        vec4 p = czm_translateRelativeToEye2(position3DHigh, position3DLow);
        gl_Position = czm_modelViewProjectionRelativeToEye * p;

        vec3 pos = position3DHigh + position3DLow;
        worldPos = czm_model * vec4(pos, 1.0);
    }
    `,
    sliceFragmentShaderPass: `
    varying vec4 worldPos;

    const int MAX_STEPS = 200;
    const float zDataSliceNumber = 63.0;

    /// 切片列数
    const int SliceNumX = 8;
    /// 切片行数
    const int SliceNumY = 8;
    /// 总切片数
    const int SliceCount = SliceNumY * SliceNumX;

    /// 
    const float SliceNumXf = float(SliceNumX);
    const float SliceNumYf = float(SliceNumY);
    const float SliceCountf = float(SliceCount);

    /// 切片的宽高
    const float SliceWidth  = 1.0 / SliceNumXf;
    const float SliceHeight = 1.0 / SliceNumYf;

    vec3 mintex = vec3(texmin_7.x, texmin_7.y, texmin_7.z);
    vec3 maxtex = vec3(texmax_8.x, texmax_8.y, texmax_8.z);

    vec2 points[8];
    void initPoints()
    {
        points[0] = vec2(line_6[0][0],line_6[0][1]);
        points[1] = vec2(line_6[0][2],line_6[0][3]);
        points[2] = vec2(line_6[1][0],line_6[1][1]);
        points[3] = vec2(line_6[1][2],line_6[1][3]);
        points[4] = vec2(line_6[2][0],line_6[2][1]);
        points[5] = vec2(line_6[2][2],line_6[2][3]);
        points[6] = vec2(line_6[3][0],line_6[3][1]);
        points[7] = vec2(line_6[3][2],line_6[3][3]);
    }

    // Z方向-256层体数据变为64层体数据
    vec4 sampleAs3DTexture( vec3 texCoord )
    {
        /// 大于等于1
        if (any(greaterThanEqual(texCoord, maxtex))) return vec4(0);
        /// 小于0
        if (any(lessThan(texCoord, mintex))) return vec4(0);


        /// 计算在第几个切片，加0.5便于计算
        float slice = texCoord.z * SliceCountf + 0.5;
        float slice_int = floor(slice);
        float slice_dot = slice - slice_int;

        ///
        float slice_n1 = slice_int - 1.0, slice_n2 = slice_int;
        if (slice_int == 0.0) slice_n1 = 0.0;
        if (slice_int == SliceCountf) slice_n2 = SliceCountf - 1.0;

        /// 
        //texCoord.y = 1.0 - texCoord.y;

        //The Z slices are stored in a matrix of 16x16 of Z slices.
        //The original UV coordinates have to be rescaled by the tile numbers in each row and column.
        texCoord.x /= float(SliceNumX);
        texCoord.y /= float(SliceNumY);

        ///
        vec2 texcoord1 = texCoord.xy;
        vec2 texcoord2 = texCoord.xy;
        //Add an offset to the original UV coordinates depending on the row and column number.
        texcoord1.x += mod(slice_n1, SliceNumXf) * SliceWidth;
        texcoord1.y += (SliceNumYf - floor(slice_n1 / SliceNumXf) - 1.0) * SliceHeight;

        texcoord2.x += mod(slice_n2, SliceNumXf) * SliceWidth;
        texcoord2.y += (SliceNumYf - floor(slice_n2 / SliceNumXf) - 1.0) * SliceHeight;

        //texcoord1.y = 1.0 - texcoord1.y;
        //texcoord2.y = 1.0 - texcoord2.y;

        /// 分别在两个切片上进行纹理采样
        vec4 color1 = texture2D( cubeTex_0, texcoord1 );
        vec4 color2 = texture2D( cubeTex_0, texcoord2 );

        /// 混合颜色
        vec4 colormix = mix(color1, color2, slice_dot);
        //vec4 colormix = color1;

        /// 对色表进行采样
        colormix.rgb = texture2D(transferTex_1, vec2(colormix.a, 1.0)).rgb;

        ///
        return colormix;
    }

//cesium.js中笛卡尔坐标转经纬度坐标算法移植
vec3 xyz2lnlt( float x, float y, float z)
{
    vec3 oneOverRadii = vec3(1.0 / 6378137.0, 1.0 / 6378137.0, 1.0 / 6356752.3142451793);
    vec3 oneOverRadiiSquared = vec3(1.0 / (6378137.0 * 6378137.0), 1.0 / (6378137.0 * 6378137.0), 1.0 / (6356752.3142451793 * 6356752.3142451793));
    float centerToleranceSquared = 0.1;

    vec3 p,n,h;
    //第一步：缩放至标准椭球表面
    float squaredNorm = x * x * oneOverRadii.x * oneOverRadii.x +  y * y * oneOverRadii.y * oneOverRadii.y + z * z * oneOverRadii.z * oneOverRadii.z;
    float ratio = sqrt(1.0 / squaredNorm);
    vec3 intersection = vec3(x, y, z) * ratio;
    p = intersection;

    // //第二步：
    // //归一化,计算高程参数h
    n.x = p.x * oneOverRadiiSquared.x;
    n.y = p.y * oneOverRadiiSquared.y;
    n.z = p.z * oneOverRadiiSquared.z;
    vec3 normal = normalize(n);

    h.x = x - p.x;
    h.y = y - p.y;
    h.z = z - p.z;

    float L = degrees(atan(normal.y,normal.x));
    float B  =degrees(asin(normal.z));
    float H = sign(h.x * x + h.y * y + h.z * z) * sqrt(h.x * h.x + h.y * h.y + h.z * h.z);
    //float H = sqrt(x * x + y * y + z * z) - 6378137.0;

    return vec3(L, B, H);
}

    void main( void ) {

        initPoints(); 

        vec3 currentPosition = worldPos.xyz;
        
        vec4 colorSample;
        float accumulatedAlpha = 0.0;

        vec3 geo = xyz2lnlt(currentPosition.x, currentPosition.y, currentPosition.z);
        geo.x = (geo.x - boxmin_4.x) / box_3.x;
        geo.y = (geo.y - boxmin_4.y) / box_3.y;
        geo.z = (geo.z - boxmin_4.z) / box_3.z;

        colorSample  = sampleAs3DTexture(geo);

        //////////////////////////////////////////////////////////////////////////
        float k,b,x;

        x = colorSample.a;
        vec2 point0 = points[0];
        for(int i = 1;i < 8;i++){
            vec2 point1 = points[i];
            if(x < point1.x){
                k = (point1.y - point0.y) / (point1.x - point0.x);
                b = point1.y - k * point1.x;
                colorSample.a = k * x + b;
                break;
            }
            point0 = point1;
        }

        colorSample.rgb = colorSample.rgb * (1.0 - accumulatedAlpha);
        accumulatedAlpha = accumulatedAlpha + colorSample.a - accumulatedAlpha * colorSample.a;
        
        gl_FragColor  = vec4(colorSample.rgb, accumulatedAlpha);
    }
    `
}

/**
 *
 * @interface 交互工具必须实现此接口
 * @see GridLine
 * @see SliceTool
 * @see RectPlane
 * @see MapVolume
 */
class _Common{
    constructor(){

    }
    update(){}
    clean(){}
    binding(){}
}
/**
 * 栅格线工具
 *
 * ------------------------to
 * |                        |
 * |                        |
 * |                        |
 * |                        |
 * |                        |
 * from---------------------
 * @author flake
 * @example new GridLine(map3DView,{longitude:100,latitude:25,height:0},{longitude:120.5,latitude:32.5,height:0})
 */

class GridLine extends _Common{
    constructor(map3dView, from, to, opt) {
        super()
        let default_opt = {
            stepX: 1,    //经度步长（度）
            stepY: 1,    //纬度步长（度）
            stepZ: 100,  //高度步长（米）
            useOrigin:false, // 是否使用原始的高度参考，为true的时候，实际高度会采用缩放高度
        }
        this.map3dView = map3dView      //公司封装之后的视图对象，类型为Init3DView
        this.Cesium = Cesium
        this.viewer = map3dView.cesium.viewer //对应Cesium框架内的Viewer类实例 ，类型为Viewer
        this.scene = map3dView.cesium.scene //对应Cesium框架内的Scene类实例 ，类型为Scene
        this.from = from
        this.to = to
        this.opt = Object.assign(default_opt, opt)
        this.xSteps = []
        this.ySteps = []
        this.zSteps = []
        this.gridLine = []
        this.scale = [1,1,1]
        this.tool = new ConvertTool(this.Cesium)
        this.entityTool = new EntityTool(this.Cesium, this.viewer)
        // 设置默认样式
        if(this.opt.style) this.style = this.opt.style
        this._show = true
        this.init()
    }

    /**
     * get/set 工具样式
     * 配置项详见EntityTool._default
     * @see EntityTool.defaultOpt
     * @return {{lineWidth: number, lineColor: Color}}
     */
    get style(){
        return this.entityTool.getDefault()
    }
    set style(opt){
        this.entityTool.defaultOpt = opt
        this.update()
    }
    /**
     * 更新数据
     */
    update(from = this.from,to = this.to,scale = this.scale){
        this.destroy()
        this.from = from
        this.to = to
        this.scale = scale
        this.init()
        this.show = !!this.show
    }

    /**
     * 清除【完全清除还是隐藏功能待定】
     */
    clean(){

    }
    init() {
        /// c3类型
        if (this.from instanceof this.Cesium.Cartesian3) {    //这里只是用一个来判断，约定from，to的类型一致
            this.from = this.tool.c3ToCartographicDegrees(this.from)
            this.to = this.tool.c3ToCartographicDegrees(this.to)
        }
        /// Cartographic
        if (this.from instanceof this.Cesium.Cartographic) {
            this.from = this.tool.cartographic2CartographicDegrees(this.from)
            this.to = this.tool.cartographic2CartographicDegrees(this.to)
        }

        let xmin = this.from.longitude,
            ymin = this.from.latitude,
            xmax = this.to.longitude,
            ymax = this.to.latitude
        this.diff = Math.abs(this.from.height - this.to.height)     //高度差，使用这个属性和实例上的stepZ属性计算z轴的网格
        this.xSteps = this.computeMiddleSpacing(xmin, xmax, this.opt.stepX)
        this.ySteps = this.computeMiddleSpacing(ymin, ymax, this.opt.stepY)
        this.zSteps = (this.diff && this.opt.stepZ) ? this.computeMiddleSpacing(this.from.height, this.to.height, this.opt.stepZ) : []

        this.createGrid()
    }

    set show(val) {
        // if (this._show === !!val) {
        //     return this._show
        // }
        this.gridLine.forEach(function (line) {
            line.show = val
        })
        return this._show = !!val
    }

    get show() {
        return this._show
    }

    /**
     * 计算中间间距<br>
     *
     * ·    ·    ·    · ·
     * @param min 最小值
     * @param max 最大值
     * @param step 步长
     * @example (1,5.5,1) => [1,2,3,4,5,5.5]
     */
    computeMiddleSpacing(min, max, step) {
        let arr = [], spacing = max - min
        for (let i = 0; i < spacing / step; i++) {
            arr.push(step * i)
        }
        if (spacing % step !== 0) {       //不是整除的时候 添加差值
            arr.push(spacing)
        }
        return arr
    }

    createGrid() {
        return this.gridLine = this.gridLine.concat(
            this._vertical(),
            this._justify()
        )
    }

    /**
     * 竖向栅格（y）
     * @private
     */
    _vertical() {
        let start = this.from,
            entitys = []
        this.xSteps.forEach((stepX, index) => {
            let lines = this.ySteps.map(stepY => {
                let one = this.tool.cartographicAdd(start, {longitude: stepX, latitude: stepY, height: 0})
                // one.height = 0
                return this.tool.c3ByDegrees(one)
            })
            if (index === 0) {
                entitys = entitys.concat(this._verticalZ(lines))
                entitys = entitys.concat(this.entityTool.addPointWithLatitude(lines))
            }
            entitys.push(this.entityTool.addPloyline(lines))
        })
        return entitys
    }

    /**
     * 横向栅格（x）
     * @private
     */
    _justify() {
        let start = this.from,
            entitys = []
        this.ySteps.forEach((stepY, index) => {
            let lines = this.xSteps.map(stepX => {
                let one = this.tool.cartographicAdd(start, {longitude: stepX, latitude: stepY, height: 0})
                // one.height = 0
                return this.tool.c3ByDegrees(one)
            })
            if (index === 0) {
                entitys = entitys.concat(this._verticalZ(lines))
                entitys = entitys.concat(this.entityTool.addPointWithLongitude(lines))
            }
            entitys.push(this.entityTool.addPloyline(lines))
        })
        return entitys
    }

    /**
     * 竖向栅格（z）
     * @private
     */
    _verticalZ(baseLine) {
        let entitys = []
        let scale = this.opt.useOrigin ? this.scale[2] : 1
        this.zSteps.forEach(step => {
            entitys.push(
                this.entityTool.addPloyline(baseLine.map(c3 => {

                    let cart = this.tool.c3ToCartographic(c3)
                    cart.height += step
                    return this.tool.c3ByRadians(cart)
                }))
            )

            let cart2 = this.tool.c3ToCartographic(baseLine[0])
            cart2.height += step

            entitys.push(
                this.entityTool.addSinglePointWithText(this.tool.c3ByRadians(cart2), ((cart2.height/scale).toFixed(1)) + 'm\n\n')
            )


        })
        return entitys
    }
    destroy(){
        let collection = this.viewer.entities
        this.gridLine.forEach(entity =>{
            collection.remove(entity)
        })
        this.gridLine = []
    }
}

/**
 * 切片工具
 * @author flake
 * @example new SliceTool(map3DView,{longitude:108.5,latitude:18,height:0},{longitude:119,latitude:27,height:0})
 */
class SliceTool extends _Common{
    constructor(map3dView, from, to, opt) {
        super()
        let default_opt = {
            sliceSize: 20        //分段个数 ，两点之间的曲线polyline和经纬度线圈不重合，采取两点分割成多个点，来近似重合
        }
        this.map3dView = map3dView      //公司封装之后的视图对象，类型为Init3DView
        this.Cesium = Cesium
        this.viewer = map3dView.cesium.viewer //对应Cesium框架内的Viewer类实例 ，类型为Viewer
        this.scene = map3dView.cesium.scene //对应Cesium框架内的Scene类实例 ，类型为Scene
        this.from = from
        this.to = to
        this.opt = Object.assign(default_opt, opt)
        this.tool = new ConvertTool(this.Cesium)
        this.entityTool = new EntityTool(this.Cesium, this.viewer)

        this._show = true
        this.planes = {
            xoy: null,
            xoz: null,
            yoz: null,
            xoy_offset: 0.5, //表示所处的位置[0-1] 0.5表示在正中间，默认值
            xoz_offset: 0.5,
            yoz_offset: 0.5,
        }
        // 设置默认样式
        if (this.opt.style){
            this.style = this.opt.style
        }else{
            this.init()
        }

    }
    /**
     * get/set 工具样式
     * 配置项详见EntityTool._default
     * @see EntityTool.defaultOpt
     * @return {{lineWidth: number, lineColor: Color}}
     */
    get style(){
        return this.entityTool.getDefault()
    }
    set style(opt){
        this.entityTool.defaultOpt = opt
        this.destroy()
        this.update()
    }

    init() {
        //初始化控制工具
        if (SliceControl && !this.sliceControl) this.sliceControl = new SliceControl(this,null,this.opt)
        /// c3类型
        if (this.from instanceof this.Cesium.Cartesian3) {    //这里只是用一个来判断，约定from，to的类型一致
            this.from = this.tool.c3ToCartographicDegrees(this.from)
            this.to = this.tool.c3ToCartographicDegrees(this.to)
        }
        /// Cartographic
        if (this.from instanceof this.Cesium.Cartographic) {
            this.from = this.tool.cartographic2CartographicDegrees(this.from)
            this.to = this.tool.cartographic2CartographicDegrees(this.to)
        }
        this.height = Math.abs(this.to.height - this.from.height)
        //初始化三个面
        this.xoy = this._getScalePoint('xoy', this.planes.xoy_offset)
        this.xoz = this._getScalePoint('xoz', this.planes.xoz_offset)
        this.yoz = this._getScalePoint('yoz', this.planes.yoz_offset)
        this.planes.xoy = (this.entityTool.addPloyline(this.tool.fromDegreesArrayWithHeight(this.xoy)))
        this.planes.xoz = (this.entityTool.addPloyline(this.tool.fromDegreesArrayWithHeight(this.xoz)))
        this.planes.yoz = (this.entityTool.addPloyline(this.tool.fromDegreesArrayWithHeight(this.yoz)))

        //创建实时更新动画
        this.planes.xoy.polyline.positions = new this.Cesium.CallbackProperty(() => {
            return this.tool.fromDegreesArrayWithHeight(this.xoy)
        }, false)
        this.planes.xoz.polyline.positions = new this.Cesium.CallbackProperty(() => {
            return this.tool.fromDegreesArrayWithHeight(this.xoz)
        }, false)
        this.planes.yoz.polyline.positions = new this.Cesium.CallbackProperty(() => {
            return this.tool.fromDegreesArrayWithHeight(this.yoz)
        }, false)

        return this.planes
    }

    update(from = this.from,to = this.to){
        this.destroy()
        this.from = from
        this.to = to
        this.init()
        this.show = !!this.show
    }
    clean(){

    }
    destroy(){
        let arr = ["xoy", "xoz", "yoz",]
        for(let val of arr){
            this.planes[val] && this.viewer.entities.remove(this.planes[val])
        }
    }
    /**
     * 绑定MapVolume
     * @param vol MapVolume实例
     */
    binding(vol){
        this.vol = vol
    }
    get control() {
        return this.sliceControl
    }

    /**
     * 使用自定义的sliceControl
     * @param sliceControl
     */
    set control(sliceControl) {
        this.sliceControl.destroy()
        this.sliceControl = sliceControl
    }

    /**
     * 根据比例获取构建面的经纬度列表
     * @param type 类型【'xoy','yoz','xoz'】分别表示【‘平行于地表的面’，‘垂直于地表的面 南北方向’，‘垂直于地表的面 东西方向’】
     * @param scale 位置比例[0-1]
     * @returns {[]} like [lng,lat,height,lng,lat,height,...]
     * @private
     */
    _getScalePoint(type, scale) {
        let xmin = this.from.longitude,
            ymin = this.from.latitude,
            xmax = this.to.longitude,
            ymax = this.to.latitude,
            zmax = this.to.height,
            zmin = this.from.height,
            target_height = zmin + (zmax - zmin) * scale,
            target_x = xmin + (xmax - xmin) * scale,
            target_y = ymin + (ymax - ymin) * scale
        let sliceSize = this.opt.sliceSize
        //平行于地表的面
        if ('xoy' === type) {
            return [xmin, ymin, target_height,
                ...ConvertTool.expansion([xmin, ymax, target_height], [xmax, ymax, target_height,], sliceSize),
                ...ConvertTool.expansion([xmax, ymin, target_height], [xmin, ymin, target_height,], sliceSize),
            ]
        }
        //垂直于地表的面 南北方向
        if ('yoz' === type) {
            return [target_x, ymin, zmin,
                ...ConvertTool.expansion([target_x, ymin, zmax], [target_x, ymax, zmax,], sliceSize),
                ...ConvertTool.expansion([target_x, ymax, zmin], [target_x, ymin, zmin], sliceSize),
            ]
        }
        //垂直于地表的面 东西方向
        if ('xoz' === type) {
            return [xmin, target_y, zmin,
                ...ConvertTool.expansion([xmin, target_y, zmax], [xmax, target_y, zmax], sliceSize),
                ...ConvertTool.expansion([xmax, target_y, zmin], [xmin, target_y, zmin], sliceSize),
            ]
        }
    }

    get offset() {
        return this.planes
    }

    set offset(obj) {
        let types = ['xoy_offset', 'xoz_offset', 'yoz_offset']

        types.forEach(val => {
            if (val in obj) {
                let v = Math.max(obj[val], 0)
                v = Math.min(obj[val], 1)
                this.planes[val] = v
                this.resetPlane(val, v)
            }
        })
        if(this.vol){
            this.vol.setSlice({
                z:obj["xoy_offset"],
                y:obj["xoz_offset"],
                x:obj["yoz_offset"],
            })
        }
        return this.planes
    }

    set show(val) {
        // if (this._show === !!val) {
        //     return this._show
        // }
        ['xoy', 'xoz', 'yoz'].forEach(key => {
            this.planes[key].show = val
        })
        if(this.sliceControl){  //隐藏/显示拖动工具
            document.querySelectorAll(".scroll-control").forEach(el =>{
                el.style.visibility = !!val ? "visible" : "hidden"
            })
        }
        return this._show = !!val
    }

    get show() {
        return this._show
    }

    resetPlane(type, value) {
        let planeName = type.slice(0, 3)
        this[planeName] = this._getScalePoint(planeName, value)
    }

    showPlane(plane, show) {
        if (this.planes[plane]) {
            return this.planes[plane].show = show
        }
    }
}

/**
 * 范围切面工具
 * @author flake
 */
class RectPlane extends _Common{
    constructor(map3dView, from, to, opt) {
        super()
        let default_opt = {
            sliceSize: 20,        //分段个数 ，两点之间的曲线polyline和经纬度线圈不重合，采取两点分割成多个点，来近似重合
            //show:true,          //加载的时候是否显示
        }
        this.map3dView = map3dView      //公司封装之后的视图对象，类型为Init3DView
        this.Cesium = Cesium
        this.viewer = map3dView.cesium.viewer //对应Cesium框架内的Viewer类实例 ，类型为Viewer
        this.scene = map3dView.cesium.scene //对应Cesium框架内的Scene类实例 ，类型为Scene
        this.from = from
        this.to = to
        this.opt = Object.assign(default_opt, opt)
        this.tool = new ConvertTool(this.Cesium)
        this.entityTool = new EntityTool(this.Cesium, this.viewer)
        this.points = []

        // 设置默认样式
        if(this.opt.style) this.style = this.opt.style
        this._show = true
        this.planes = {}
        this.init()
    }
    /**
     * get/set 工具样式
     * 配置项详见EntityTool._default
     * @see EntityTool.defaultOpt
     * @return {{lineWidth: number, lineColor: Color}}
     */
    get style(){
        return this.entityTool.getDefault()
    }
    set style(opt){
        this.entityTool.defaultOpt = opt
        this.update()
    }

    update(from = this.from,to = this.to){
        this.from = from
        this.to = to
        this.destroy()
        this.init()
        this.show = !!this.show
    }
    clean(){

    }
    /**
     * 绑定MapVolume
     * @param vol MapVolume实例
     */
    binding(vol){
        this.vol = vol
    }
    destroy(){
        let collection = this.viewer.entities

        for(let key in this.planes){
            collection.remove(this.planes[key])
        }

        this.points && this.points.forEach(entity => {
            collection.remove(entity)
        })

        this.planes = {}
        this.points = []
    }
    init() {
        /// c3类型
        if (this.from instanceof this.Cesium.Cartesian3) {    //这里只是用一个来判断，约定from，to的类型一致
            this.from = this.tool.c3ToCartographicDegrees(this.from)
            this.to = this.tool.c3ToCartographicDegrees(this.to)
        }
        /// Cartographic
        if (this.from instanceof this.Cesium.Cartographic) {
            this.from = this.tool.cartographic2CartographicDegrees(this.from)
            this.to = this.tool.cartographic2CartographicDegrees(this.to)
        }
        this.height = Math.abs(this.to.height - this.from.height)
        let result = this._getPoints()
        let ps = this.eightPoint //this._getPoints(this.from,this.to)

        this.copy_to = this.tool.c3ByDegrees(this.to)
        this.copy_from = this.tool.c3ByDegrees(this.from)

        this.planes.p_top = this.entityTool.addPloyline([...ConvertTool.expansionC3(ps.$001, ps.$101,this.opt.sliceSize), ...ConvertTool.expansionC3(ps.$111, ps.$011,this.opt.sliceSize), ps.$001])
        this.planes.p_left = this.entityTool.addPloyline([ps.$000, ps.$010, ps.$011, ps.$001, ps.$000])
        this.planes.p_right = this.entityTool.addPloyline([ps.$100, ps.$110, ps.$111, ps.$101, ps.$100])
        this.planes.p_bottom = this.entityTool.addPloyline([...ConvertTool.expansionC3(ps.$000, ps.$100,this.opt.sliceSize), ...ConvertTool.expansionC3(ps.$110, ps.$010,this.opt.sliceSize), ps.$000])
        this.planes.p_front = this.entityTool.addPloyline([...ConvertTool.expansionC3(ps.$000, ps.$100,this.opt.sliceSize), ...ConvertTool.expansionC3(ps.$101, ps.$001,this.opt.sliceSize), ps.$000])
        this.planes.p_behind = this.entityTool.addPloyline([...ConvertTool.expansionC3(ps.$010, ps.$110,this.opt.sliceSize), ...ConvertTool.expansionC3(ps.$111, ps.$011,this.opt.sliceSize), ps.$010])

        //创建实时更新动画
        this.planes.p_top.polyline.positions = new this.Cesium.CallbackProperty(() => {
            let ps = this.eightPoint
            return [...ConvertTool.expansionC3(ps.$001, ps.$101,this.opt.sliceSize), ...ConvertTool.expansionC3(ps.$111, ps.$011,this.opt.sliceSize), ps.$001]
        }, false)
        this.planes.p_left.polyline.positions = new this.Cesium.CallbackProperty(() => {
            let ps = this.eightPoint
            return [ps.$000, ps.$010, ps.$011, ps.$001, ps.$000]
        }, false)
        this.planes.p_right.polyline.positions = new this.Cesium.CallbackProperty(() => {
            let ps = this.eightPoint
            return [...ConvertTool.expansionC3(ps.$000, ps.$100,this.opt.sliceSize), ...ConvertTool.expansionC3(ps.$110, ps.$010,this.opt.sliceSize), ps.$000]
        }, false)
        this.planes.p_bottom.polyline.positions = new this.Cesium.CallbackProperty(() => {
            let ps = this.eightPoint
            return [...ConvertTool.expansionC3(ps.$000, ps.$100,this.opt.sliceSize), ...ConvertTool.expansionC3(ps.$110, ps.$010,this.opt.sliceSize), ps.$000]
        }, false)
        this.planes.p_front.polyline.positions = new this.Cesium.CallbackProperty(() => {
            let ps = this.eightPoint
            return [...ConvertTool.expansionC3(ps.$000, ps.$100,this.opt.sliceSize), ...ConvertTool.expansionC3(ps.$101, ps.$001,this.opt.sliceSize), ps.$000]
        }, false)
        this.planes.p_behind.polyline.positions = new this.Cesium.CallbackProperty(() => {
            let ps = this.eightPoint
            return [...ConvertTool.expansionC3(ps.$010, ps.$110,this.opt.sliceSize), ...ConvertTool.expansionC3(ps.$111, ps.$011,this.opt.sliceSize), ps.$010]
        }, false)

        this.points = this.entityTool.addPoint(this.sixPoint)
        this.handler()
        return this.planes
    }

    /**
     * 获取坐标的8+6个点 ${z}{y}{z}
     *       _________________$111
     *      /               / |
     *     /_______________/  |
     *     |               |  |
     *     |               | /
     * $000|_______________|/
     * @param from this.from
     * @param to this.to
     * @private
     */
    _getPoints(from, to) {
        from = from || this.from
        to = to || this.to
        // let xmin = Math.max(from.longitude,this.from.longitude),
        //     ymin = Math.max(from.latitude,this.from.latitude),
        //     hmin = Math.max(from.height,this.from.height),
        //     xmax = Math.min(to.longitude,this.to.longitude),
        //     ymax = Math.min(to.latitude,this.to.latitude),
        //     hmax = Math.min(to.height,this.to.height),
        let xmin = from.longitude,
            ymin = from.latitude,
            hmin = from.height,
            xmax = to.longitude,
            ymax = to.latitude,
            hmax = to.height,
            half_x = (xmax + xmin) / 2,
            half_y = (ymax + ymin) / 2,
            half_z = (hmax + hmin) / 2

        let $000 = this._createLLH(xmin, ymin, hmin),
            $100 = this._createLLH(xmax, ymin, hmin),
            $110 = this._createLLH(xmax, ymax, hmin),
            $010 = this._createLLH(xmin, ymax, hmin),
            $001 = this._createLLH(xmin, ymin, hmax),
            $101 = this._createLLH(xmax, ymin, hmax),
            $011 = this._createLLH(xmin, ymax, hmax),
            $111 = this._createLLH(xmax, ymax, hmax),

            $top = this._createLLH(half_x, half_y, hmax),
            $left = this._createLLH(xmin, half_y, half_z),
            $right = this._createLLH(xmax, half_y, half_z),
            $bottom = this._createLLH(half_x, half_y, hmin),
            $front = this._createLLH(half_x, ymin, half_z),
            $behind = this._createLLH(half_x, ymax, half_z)

        this.eightPoint = {
            $000,
            $100,
            $110,
            $010,
            $001,
            $101,
            $011,
            $111,
        }
        this.sixPoint = [
            $top,
            $left,
            $right,
            $bottom,
            $front,
            $behind,
        ]

        return [$001, $101, $111, $011,    //上面
            $000, $100, $110, $010,        //下面
            $top, $left, $right, $bottom, $front, $behind,  //中心点
        ]
    }

    _setPoints(c3) {
        let point = this.tool.c3ToCartographicDegrees(c3)
        let sub = this.Cesium.Cartesian3.subtract(c3, this.sixPoint[this.movingPointIndex], new this.Cesium.Cartesian3())
        let to, from

        //max(..min()) min(..max()) 都是为了限定最终计算的点在最大最小范围内，使用case每次只影响一个方向
        switch (this.movingPointIndex) {
            case 0: //上面
                to = this.tool.c3ToCartographicDegrees(this.copy_to)
                to.height = Math.max(Math.min(point.height, this.to.height), this.from.height)

                this.copy_to = this.tool.c3ByDegrees(to)
                break;
            case 2: //右边
                to = this.tool.c3ToCartographicDegrees(this.copy_to)
                to.longitude = Math.max(Math.min(point.longitude, this.to.longitude), this.from.longitude)

                this.copy_to = this.tool.c3ByDegrees(to)
                break;
            case 5: //后面
                to = this.tool.c3ToCartographicDegrees(this.copy_to)
                to.latitude = Math.max(Math.min(point.latitude, this.to.latitude), this.from.latitude)

                this.copy_to = this.tool.c3ByDegrees(to)
                break;
            case 1: //左边
                from = this.tool.c3ToCartographicDegrees(this.copy_from)
                from.longitude = Math.min(Math.max(point.longitude, this.from.longitude), this.to.longitude)

                this.copy_from = this.tool.c3ByDegrees(from)
                break;
            case 3: //下面
                from = this.tool.c3ToCartographicDegrees(this.copy_from)
                from.height = Math.min(Math.max(point.height, this.from.height), this.to.height)

                this.copy_from = this.tool.c3ByDegrees(from)
                break;
            case 4: //前面
                from = this.tool.c3ToCartographicDegrees(this.copy_from)
                from.latitude = Math.min(Math.max(point.latitude, this.from.latitude), this.to.latitude)

                this.copy_from = this.tool.c3ByDegrees(from)
                break;
        }
        //限定移动区域在最大和最小的区域范围之内
        let tmp_from = this.tool.c3ToCartographicDegrees(this.copy_from),
            tmp_to = this.tool.c3ToCartographicDegrees(this.copy_to)
        let eight = this._getPoints(tmp_from, tmp_to)
        this.points.forEach((entity, index) => {
            entity.position = this.sixPoint[index]
        })
        if(this.vol){       //体数据范围更新
            let _from = this.tool.c3ByDegrees(this.from)

            this.vol.range = {
                minHeight:tmp_from.height,
                minLongitude:Math.abs(ConvertTool.pointPlaneInstance(eight[4],eight[5],_from)),
                maxLatitude:Math.abs(ConvertTool.pointPlaneInstance(eight[7],eight[4],_from)),
                maxHeight:tmp_to.height,
                maxLongitude:Math.abs(ConvertTool.pointPlaneInstance(eight[5],eight[4],_from)),
                minLatitude:Math.abs(ConvertTool.pointPlaneInstance(eight[4],eight[7],_from)),
            }
        }
    }

    /**
     * 创建经纬度高度对象
     * @param longitude
     * @param latitude
     * @param height
     * @returns {{longitude: *, latitude: *, height: *}}
     * @private
     */
    _createLLH(longitude, latitude, height) {
        return this.Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
    }

    handler() {
        this.control = new this.Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        let handler = this.control
        let old_time = new Date().getTime()
        let interval = 50
        //左键按下
        handler.setInputAction(e => {

            this.moving = true
            this.pointDraged = this.viewer.scene.pick(e.position);//选取当前的entity
            this.leftDownFlag = true;
            if (this.pointDraged) {

                this.movingPointIndex = this.points.indexOf(this.pointDraged.id)  //当前正在被移动的点
                //console.info(this.movingPoint)
                if (this.movingPointIndex > -1)
                    this.viewer.scene.screenSpaceCameraController.enableRotate = false;//锁定相机
            }
        }, this.Cesium.ScreenSpaceEventType.LEFT_DOWN);

        //左键松开
        handler.setInputAction(e => {
            this.moving = false
            this.leftDownFlag = false;
            if (!this.pointDraged) return

            this.pointDraged = null;
            this.viewer.scene.screenSpaceCameraController.enableRotate = true;//解锁相机
        }, this.Cesium.ScreenSpaceEventType.LEFT_UP);

        //鼠标移动
        handler.setInputAction(e => {
            if (Date.now() - old_time < interval) return
            this.hoverHandler(e)
            if (this.leftDownFlag === true && this.pointDraged != null) {

                let ray = this.viewer.camera.getPickRay(e.endPosition);
                let entity = this.points[this.movingPointIndex]
                if (!entity) return  //movingPointIndex为-1的情况 获取不到entity
                let intersectPoint = this.getPlaneIntersect(entity.position._value, ray)

                let c3 = this._getAxisCarsian(this.tool.c3ToCartographicDegrees(entity.position._value), intersectPoint)
                //entity.position = c3

                this._setPoints(c3)
            }
            old_time = Date.now()
        }, this.Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    }

    /**
     * 鼠标移入处理 </br>
     *
     * @param e
     */
    hoverHandler(e) {

        if (this.leftDownFlag) return
        let ray = this.viewer.camera.getPickRay(e.endPosition);
        let entity = this.viewer.scene.pick(e.endPosition);   //选取当前的entity
        if (entity && entity.id && entity.id.point) {

            entity.id.point.pixelSize = 1.5 * this.style.pointSize
        } else {
            this.points.forEach(point=> {
                point.point.pixelSize = this.style.pointSize
            })
        }
    }

    /**
     * 获取平面相交点
     * @param redPoint 参考系原点（红点）
     * @param ray 垂直屏幕的光线
     * @return {
     *     'xOy':c3,
     *     'xOz':c3,
     *     'yOz':c3,
     * }
     */
    getPlaneIntersect(redPoint, ray) {
        let point = redPoint
        // let camera = this.viewer.camera
        let planes = [{
            name: "xOz",
            PHR: {
                heading: 90,
                pitch: 0
            }
        }, {
            name: "yOz",
            PHR: {
                heading: 0,
                pitch: 0
            }
        }, {
            name: "xOy",
            PHR: {
                heading: 0,
                pitch: 90
            }
        }]

        let result = {}

        let tmp = new this.Cesium.Cartesian3(0, 0, 0)
        planes.forEach(plane => {
            let next = this.rotate(point, plane.PHR)
            let sub = this.Cesium.Cartesian3.subtract(next, point, tmp)
            let normal = this.Cesium.Cartesian3.normalize(sub, tmp)
            let oOo = this.Cesium.Plane.fromPointNormal(point, normal) //Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(next,point))
            let po = this.Cesium.IntersectionTests.rayPlane(ray, oOo)

            //未产生交点的时候 使用红点
            result[plane.name] = this.tool.c3ToCartographicDegrees(po || point)

        })

        return result
    }

    /**
     * 获取坐标轴（或者xOy面）上的位置
     * @param entity 实体
     * @param oldp 原始点
     * @param newp 新点
     * @returns {*}
     */
    _getAxisCarsian(oldp, intersectPoint) {

        let newpoint
        //$top, $left, $right, $bottom, $front, $behind
        switch (this.movingPointIndex) {
            case 1:
            case 2:
                newpoint = intersectPoint['xOz']
                return this.Cesium.Cartesian3.fromDegrees(newpoint.longitude, oldp.latitude, oldp.height)
            case 4:
            case 5:
                newpoint = intersectPoint['yOz']
                return this.Cesium.Cartesian3.fromDegrees(oldp.longitude, newpoint.latitude, oldp.height)
            case 0:
            case 3:
                newpoint = intersectPoint[this._viewerPlane()]
                return this.Cesium.Cartesian3.fromDegrees(oldp.longitude, oldp.latitude, newpoint.height)
        }
    }

    _viewerPlane() {
        let camera = this.viewer.scene.camera
        //135°~315°使用 xOz面
        return camera.heading > 0.75 * Math.PI && camera.heading < 1.75 * Math.PI ? 'xOz' : 'yOz'
    }

    /**
     * 获取旋转后的的坐标
     *
     *     -----
     *   /       \
     * |          \
     * |    ·------|
     * \          /
     *  ----------
     *
     * @param base 原点
     * @param opt heading and pitch (控制旋转的角度)
     * @return {Cartesian3} c3
     */
    rotate(base, opt) {
        let heading = this.Cesium.Math.toRadians(opt.heading);
        let pitch = this.Cesium.Math.toRadians(opt.pitch);
        let headingPitchRoll = new this.Cesium.HeadingPitchRoll(heading, pitch, 0);

        let mat4 = this.Cesium.Transforms.headingPitchRollToFixedFrame(base, headingPitchRoll);

        let vec3 = new this.Cesium.Cartesian3(300, 0, 0);
        return this.Cesium.Matrix4.multiplyByPoint(mat4, vec3, new this.Cesium.Cartesian3());

    }

    get show() {
        return this._show;
    }

    set show(val) {
        // if (this._show === !!val) {
        //     return this._show
        // }
        //隐藏点
        this.points.forEach(entity => {
            entity.show = val
        })
        //隐藏面
        for (let key in this.planes) {
            this.planes[key].show = val
        }
        return this._show = !!val
    }
}

/**
 * 转换工具<br>
 * 一些简单的转换工具<br>
 * 只依赖核心的Cesium对象
 * @author flake
 */
class ConvertTool {
    constructor(Cesium) {
        this.Cesium = Cesium
    }

    /**
     * 获取一个经纬度坐标【弧度制】
     * @param cartesian c3坐标
     * @return {Cartographic}
     */
    c3ToCartographic(cartesian) {
        return this.Cesium.Cartographic.fromCartesian(cartesian)
    }

    /**
     * 获取一个经纬度坐标【度】
     * @param cartesian c3坐标
     * @return {Object}
     */
    c3ToCartographicDegrees(cartesian) {
        let cartographic = this.Cesium.Cartographic.fromCartesian(cartesian)

        return this.cartographic2CartographicDegrees(cartographic)
    }

    /**
     * 经纬度坐标 弧度转度
     * @param cartographic 经纬度坐标【弧度制】
     * @return {{longitude: Number, latitude: Number, height: Number}}
     */
    cartographic2CartographicDegrees(cartographic) {
        return {
            longitude: this.radians2Degrees(cartographic.longitude),
            latitude: this.radians2Degrees(cartographic.latitude),
            height: cartographic.height,
        }
    }

    /**
     * 得到一个c3坐标
     * @param cartographic 度类型的经度纬度高度
     * @return {Cartesian3}
     */
    c3ByDegrees(cartographic) {
        return this.Cesium.Cartesian3.fromDegrees(cartographic.longitude, cartographic.latitude, cartographic.height)
    }

    /**
     * 根据经纬度高度数组拿到c3数组
     * @param arr like[lng,lat,height,lng,lat,height,...]
     * @returns {Array}.Cartesian3
     */
    fromDegreesArrayWithHeight(arr) {
        let c3 = []
        for (let i = 0; i < arr.length; i += 3) {
            c3.push(Cesium.Cartesian3.fromDegrees(arr[i], arr[i + 1], arr[i + 2]))
        }
        return c3
    }

    /**
     * 得到一个c3坐标
     * @param cartographic 弧度类型的经度纬度高度
     * @return {Cartesian3}
     */
    c3ByRadians(cartographic) {
        return this.Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height)
    }

    /**
     * 弧度转度
     * @param radians 弧度
     * @return {Number}
     */
    radians2Degrees(radians) {
        return this.Cesium.Math.toDegrees(radians)
    }

    /**
     * 度转弧度
     * @param degrees 度
     * @return {Number}
     */
    degrees2Radians(degrees) {
        return this.Cesium.Math.toRadians(degrees)
    }

    /**
     * 经纬度相加
     * @param left
     * @param right
     * @return {{longitude: Number, latitude: Number, height: Number}}
     */
    cartographicAdd(left, right) {
        return {
            longitude: left.longitude + right.longitude,
            latitude: left.latitude + right.latitude,
            height: Math.max(left.height, right.height),
        }
    }

    /**
     * 扩容
     * @param left 左边点
     * @param right 右边点
     * @param size 目标点个数
     * @returns {Array} [lng,lat,height,lng,lat,height,...]
     */
    static expansion(left, right, size) {
        let xStep = (right[0] - left[0]) / size,
            yStep = (right[1] - left[1]) / size,
            zStep = (right[2] - left[2]) / size,
            arr = []
        for (let i = 0; i < size; i++) {
            if (i === size - 1) { //避免计算误差
                arr.push(...right)
            } else {
                arr.push(left[0] + xStep * i, left[1] + yStep * i, left[2] + zStep * i)
            }
        }

        return arr
    }
    /**
     * 扩容
     * @param left{Cartesian3} 左边点
     * @param right{Cartesian3} 右边点
     * @param size 目标点个数
     * @returns {Array} [lng,lat,height,lng,lat,height,...]
     */
    static expansionC3(p1, p2, size) {


        let cartographic1 = Cesium.Cartographic.fromCartesian(p1),
            cartographic2 = Cesium.Cartographic.fromCartesian(p2),
            left = [Cesium.Math.toDegrees(cartographic1.longitude),Cesium.Math.toDegrees(cartographic1.latitude),cartographic1.height],
            right = [Cesium.Math.toDegrees(cartographic2.longitude),Cesium.Math.toDegrees(cartographic2.latitude),cartographic2.height]

        return Cesium.Cartesian3.fromDegreesArrayHeights(ConvertTool.expansion(left,right,size))
    }

    /**
     * 计算合并，返回一个最大值的经纬度高度对象
     * @return {{longitude: *, latitude: *, height: *}}
     */
    static mergeMax() {
        let longitude = arguments[0].longitude,
            latitude = arguments[0].latitude,
            height = arguments[0].height

        for (let i = 0, length = arguments.length; i < length; i++) {
            longitude = Math.max(longitude, arguments[i].longitude)
            latitude = Math.max(latitude, arguments[i].latitude)
            height = Math.max(height, arguments[i].height)
        }
        return {
            longitude,
            latitude,
            height
        }
    }

    /**
     * 计算合并，返回一个最小值的经纬度高度对象
     * @return {{longitude: *, latitude: *, height: *}}
     */
    static mergeMin() {
        let longitude = arguments[0].longitude,
            latitude = arguments[0].latitude,
            height = arguments[0].height

        for (let i = 0, length = arguments.length; i < length; i++) {
            longitude = Math.min(longitude, arguments[i].longitude)
            latitude = Math.min(latitude, arguments[i].latitude)
            height = Math.min(height, arguments[i].height)
        }
        return {
            longitude,
            latitude,
            height
        }
    }

    /**
     * 点面距离计算
     * planePoint1位于面上，planePoint2与planePoint1构成法线
     * 如果距离为正，则该点位于法线方向的半空间中; 如果为负，则该点位于与法线相反的半空间中; 如果为零，点在面上
     * @param planePoint1
     * @param planePoint2
     * @param point
     * @return {*}
     */
    static pointPlaneInstance(planePoint1,planePoint2,point){
        let sub = Cesium.Cartesian3.subtract(planePoint2,planePoint1,new Cesium.Cartesian3(0,0,0))
        let normal = Cesium.Cartesian3.normalize(sub,new Cesium.Cartesian3(0,0,0))
        let plane = Cesium.Plane.fromPointNormal(planePoint1,normal)
        return Cesium.Plane.getPointDistance(plane,point)
    }
}

/**
 * 实体工具
 * @author flake
 */
class EntityTool {
    constructor(Cesium, viewer) {
        this.Cesium = Cesium
        this.viewer = viewer //对应Cesium框架内的Viewer类实例 ，类型为Viewer

        this._default = {
            lineWidth: 15,
            lineColor: this.Cesium.Color.CORAL,
            pointSize: 10,
            pointColor: this.Cesium.Color.DEEPSKYBLUE,
            textColor: this.Cesium.Color.DEEPSKYBLUE
        }
    }
    set defaultOpt(opt){
        this._default = Object.assign(this._default,opt)
    }
    get defaultOpt(){
        return this._default
    }
    /**
     * 添加折线
     * @param pos Array.[Cartesian3]
     * @return Entity
     */
    addPloyline(pos,option) {
        let opt = Object.assign(this.getDefault(),option)
        return this.viewer.entities.add({
            polyline: {
                positions: pos,
                material: new this.Cesium.PolylineGlowMaterialProperty({
                    glowPower: 0.2,
                    taperPower: 0.5,
                    color: opt.lineColor
                }),
                //material: new Cesium.PolylineArrowMaterialProperty(this.Cesium.Color.CORNFLOWERBLUE),
                "width": opt.lineWidth,
                "clampToGround": false
            }
        })
    }

    /**
     * 获取默认配置
     * @return {{lineWidth: number, lineColor: Color}}
     */
    getDefault(){
        return this._default
    }
    /**
     * 添加点
     * @param pos Array.[Cartesian3]
     * @return Array.[Entity]
     */
    addPoint(pos, labelGraphics,option) {
        let opt = Object.assign(this.getDefault(),option)
        return pos.map(point => {
            return this.viewer.entities.add({
                position: point,
                point: {
                    pixelSize: opt.pointSize,
                    color:opt.pointColor
                },
                label: labelGraphics
            })
        })
    }

    /**
     * 添加点附加经度文字
     * @param pos Array.[Cartesian3]
     */
    addPointWithLongitude(pos,option) {
        let opt = Object.assign(this.getDefault(),option)
        return pos.map(point => {
            return this.viewer.entities.add({
                position: point,
                point: {
                    pixelSize: opt.pointSize,
                    color:opt.pointColor
                },
                label: {
                    text: '\n\n\n\n' + ((this.Cesium.Cartographic.fromCartesian(point).longitude) / Math.PI * 180).toFixed(1),
                    font: '16px sans-serif',
                    fillColor:opt.textColor
                }
            })
        })
    }

    /**
     * 添加点附加纬度文字
     * @param pos Array.[Cartesian3]
     */
    addPointWithLatitude(pos,option) {
        let opt = Object.assign(this.getDefault(),option)
        return pos.map(point => {
            return this.viewer.entities.add({
                position: point,
                point: {
                    pixelSize: opt.pointSize,
                    color:opt.pointColor
                },
                label: {
                    text: '\n\n' + ((this.Cesium.Cartographic.fromCartesian(point).latitude) / Math.PI * 180).toFixed(1),
                    font: '16px sans-serif',
                    fillColor:opt.textColor
                }
            })
        })
    }

    /**
     * 添加单点和文字
     * @param pos Cartesian3
     * @param text 文本信息
     * @return Entity
     */
    addSinglePointWithText(pos, text,option) {
        let opt = Object.assign(this.getDefault(),option)
        return this.viewer.entities.add({
            position: pos,
            point: {
                pixelSize: opt.pointSize,
                color:opt.pointColor
            },
            label: {
                text: text,
                font: '16px sans-serif',
                fillColor:opt.textColor
            }
        })
    }

}

/**
 * 页面的切片工具对应的控制工具
 */
class SliceControl {
    /**
     * 构造函数
     * @param slice {SliceTool} SliceTool实例
     * @param el {String | HTMLElement | null} 元素，为null时会默认创建一个元素
     * @param opt {
     *     buttonClick(event,planeType,show)：xyz按钮的点击事件的回调,event：元素事件对象；planeType：轴对应的面；show：['show','hide']
     *     move(call,ele,type) xyz轴移动的回调,call移动的实时信息；ele:['X','Y','Z'];type:['move','end']
     * }
     */
    constructor(slice, el, opt) {
        this.slice = slice
        this.opt = opt || {}
        if (typeof el === 'string') {
            this.root = document.querySelector(el)
        } else if (typeof el === 'object' && el instanceof HTMLElement) {
            this.root = el
        } else {
            this.root = this._createRoot()
        }
        this._createChild()
        this.init()
        this.bindingEvent()

        //储存当前的位置
        this._x = 0.5
        this._y = 0.5
        this._z = 0.5
    }

    init() {
        if(this.inited) return
        //添加默认的class和属性，请使用slice.control.css来控制样式
        this.root.classList.add("scroll-control")
        this.root.setAttribute("data-allow", "volume")
        //xyz 显示隐藏控制
        this.root.addEventListener("click", e => {
            if (e.target.tagName.toLowerCase() === 'span') {
                let map = {X: 'yoz', Y: 'xoz', Z: 'xoy'}
                let type = map[e.target.innerHTML]

                if (e.target.className === 'active') {
                    e.target.className = ''
                    this.slice.showPlane(type, true)
                } else {
                    e.target.className = 'active'
                    this.slice.showPlane(type, false)
                }
                if (typeof this.opt.buttonClick === 'function') {
                    this.opt.buttonClick(e, type, e.target.className === 'active' ? 'show' : 'hide')
                }
            }
            e.stopPropagation()
        })
        this.inited = true
    }

    _createRoot() {
        let root = document.createElement("div")
        document.body.appendChild(root)
        return root
    }

    _createChild() {
        this.root.innerHTML = this._createChildEle('X')
            + this._createChildEle('Y')
            + this._createChildEle('Z')

    }

    _createChildEle(type) {
        return `
            <div class="control">
                <span>${type}</span>
                <div class="scroll" id="scrollBar${type}">
                    <div class="bar"></div>
                    <div class="mask"></div>
                </div>
            </div>
`
    }

    bindingEvent() {
        if (typeof this.opt.move !== 'function') {
            this.opt.move = function () {

            }
        }
        this._createBar({
            el: "#scrollBarX",
            move: call => {
                this._sliceOffset('_x',call)
                this.opt.move(call, 'X', 'move')
            },
            end: call => {
                this._sliceOffset('_x',call)
                this.opt.move(call, 'X', 'end')
            }
        })
        this._createBar({
            el: "#scrollBarY",
            move: call => {
                this._sliceOffset('_y',call)
                this.opt.move(call, 'Y', 'move')
            },
            end: call => {
                this._sliceOffset('_y',call)
                this.opt.move(call, 'Y', 'end')
            }
        })
        this._createBar({
            el: "#scrollBarZ",
            move: call => {
                this._sliceOffset('_z',call)
                this.opt.move(call, 'Z', 'move')
            },
            end: call => {
                this._sliceOffset('_z',call)
                this.opt.move(call, 'Z', 'end')
            }
        })
    }

    /**
     * 设置体数据切片的位置
     * @param key 轴对应的变量
     * @param call 轴移动的回调参数
     * @private
     */
    _sliceOffset(key,call){
        this[key] = call.scale
        this.slice.offset = {
            yoz_offset: this._x,
            xoz_offset: this._y,
            xoy_offset: this._z,
        }
    }
    _createBar(obj) {
        // 获取元素
        let scrollBar = this.root.querySelector(obj.el);
        let bar = scrollBar.children[0];
        let mask = scrollBar.children[1];
        let timer = new Date().getTime()
        // 拖动
        bar.onmousedown = function (event) {
            let leftVal = event.clientX - this.offsetLeft;
            // 拖动放到down的里面
            let that = this;
            document.onmousemove = function (event) {
                let new_time = new Date().getTime()
                if (new_time - timer < 17) {
                    return
                }
                timer = new_time
                that.style.left = event.clientX - leftVal + "px";
                // 限制条件
                let val = parseInt(that.style.left);
                if (val < 0) {
                    that.style.left = 0;
                } else if (val > 382) {
                    that.style.left = "382px";
                }
                // 移动的距离为遮罩的宽度
                mask.style.width = that.style.left;
                // 回调
                if (typeof obj.move === 'function') obj.move({
                    type: 'move',
                    scrollBar: scrollBar,
                    elText: obj.el,
                    scale: (parseInt(that.style.left) / 382)
                })
                // 清除拖动 --- 防止鼠标已经弹起时还在拖动
                window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
            }
            // 鼠标抬起停止拖动
            document.onmouseup = function () {
                if (typeof obj.end === 'function') obj.end({
                    type: 'end',
                    scrollBar: scrollBar,
                    elText: obj.el,
                    scale: (parseInt(that.style.left) / 382)
                })
                document.onmousemove = null;
                document.onmouseup = null;
            }
        }
    }

    destroy() {
        this.root.parentNode.removeChild(this.root)
        this.slice = null
        this.opt = null
    }
}

class MapVolume extends _Common{
    constructor(map3dView,from,to, options) {
        super()

        ///
        this._map = map3dView;
        this._box = {
            "xmax":to.longitude,"xmin":from.longitude,
            "ymax":to.latitude,"ymin":from.latitude,
            "zmax":to.height,"zmin":from.height,
            "avalibleflag":true
        };
        this._sliceNum = options.sliceNum ? options.sliceNum : [8,8];
        this._scale = options.scale ? options.scale : [1, 1, 1];
        this._offset = options.offset ? options.offset : [0, 0, 0];
        this._line = [0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0,0.0, 0.0, 0.0, 0.0,0.0, 0.0, 0.0, 0.0];
        //订阅者
        this.bindingCollection = []
        //观察者
        this.handlers = {}
        //存储各自变量
        this._vol = {
            pri: null,
            apprance: null,
            mat: null
        };
        this._sect = {
            pri: [],
            apprance: null,
            mat: null
        };

        if(options){
            this.filterParam =  options.filterParam || {}
        }

        this._url = options.url ? options.url : "BaseWhite";

        /// 加载体数据（纹理）
        this._loadImage(this._url)
        this._color = options.colorMap
        let stamp = Date.parse(new Date());
        this._name = options.name ? options.name : ("Volume_TimeStap_" + stamp);

        this._sectpri = [];
        this.SURFACE = 1        //曲面模式标志位

        // 体数据渲染的模式，1表示采用曲面代理几何渲染,0表示正立方体渲染
        this.mode = (options && options.mode === 1) ? 1 : 0;
        let _this = this
        ///过滤分析
        if (FilterEdit && !this._filterControl) {
            let param=Object.assign({
                split_X:4,
                split_Y:2,
                tolerance:3,
                min_X: 0,
                max_X: 1000,
                max_Y: 1000,
                min_Y: 0,
            },this.filterParam || {});

            /// 属性过滤界面
            let div = document.createElement("div");
            div.className = "analysis";
            div.setAttribute("data-allow","volume");
            document.body.appendChild(div);

            /// 属性过滤
            this._filterControl = new FilterEdit(div,param);

            //拖动事件:line为当前折线,position为控制点的位置
            this._filterControl.onchangestatus = function (position, line) {

            }
            //拖动结束事件:line为当前折线,position为控制点的位置
            this._filterControl.onchangestatus_over = function (position, line) {
                // 最多接收16个值
                _this.filterLine = line.flat().slice(0,16).map((num,index)=> index%2 === 0 ? num/param.max_X : num/param.max_Y)
            }
        }

    }

    /**
     * get/set 过滤分析的控制元素对象
     * @param filterControl
     * @see FilterEdit
     */
    set filterControl(filterControl){
        this._filterControl = filterControl
    }
    get filterControl(){
        return this._filterControl
    }
    // get/set 可见性
    set visible(visible) {
        this._visible = visible;
        this._vol.pri && (this._vol.pri.show = visible);
    }

    get visible() {
        return this._visible
    }

    // get/set 盒子属性
    set box(box) {
        this._box = box;
    }

    get box() {
        return this._box;
    }

    /**
     * get/set 缩放比例
     * @param scale [xScale,yScale,zScale]
     * @example vol.scale = [1,1,2] z轴扩展两倍
     */
    set scale(scale) {
        this._scale = scale;
        let calc = this._calcParam()
        this.update(calc.from,calc.to)
        this.refresh();
    }

    get scale() {
        return this._scale;
    }
    // get/set 清晰度
    set sharpness(sharpness){
        this._sharpness = sharpness
    }
    get sharpness(){
        return this._sharpness
    }
    /**
     * get/set 偏移量
     * @param offset [x,y,z]
     * @example vol.offset = [0,0,100] 模型抬起100米
     */
    set offset(offset){
        this._offset = offset
        let calc = this._calcParam()
        this.update(calc.from,calc.to)
        this.refresh();
    }

    get offset(){
        return this._offset
    }

    set filterLine(line){
        this._line = line;
        if (line.length > 16) line.length = 16;
        if (line.length < 16)
        {
            for (let i = line.length; i < 16; ++i)
            {
                line[i] = 16;
            }
        }
        //过滤
        if (Array.isArray(line)) {
            if(this._vol.mat){
                this._vol.mat.uniforms.u_VolFilterLine = line;
            }
            if (this._sect.mat)
            {
                this._sect.mat.uniforms.u_VolFilterLine = line;
            }
        }
    }

    get filterLine(){
        return this._line
    }

    /**
     * 切片体的显示和隐藏
     * @param val
     */
    set sliceVisble(val){
        this._sectpri.forEach(pri => {
            pri.show = !!val
        })
    }
    set sliceXVisble(val){
        this._sectpri[0].show = !!val
    }
    set sliceYVisble(val){
        this._sectpri[1].show = !!val
    }
    set sliceZVisble(val){
        this._sectpri[2].show = !!val
    }

    initShader() {
        this.shader = GLSL_VOLUME_SURFACE;
    }
    update(from,to){

        //TODO 实现体数据的更新
        let calc = this._calcParam()
        if(!from){
            from = calc.from
        }
        if(!to){
            to = calc.to
        }

        this.bindingCollection.forEach(tool => {
            tool.update(from,to,this.scale)
        })
    }
    clean(){

    }

    /**
     * 加载体数据图片
     * @param url
     * @private
     */
    _loadImage(url){
        let _this = this

        /**
         * 标志位 表示图片的加载状态
         * @type {number} {0:未完成,1:已完成,-1:已失败}
         */
        this.imageLoaded = 0;
        this.image = this.image || new Image()
        this.image.src = url
        this.image.crossOrigin = "anonymous"    //允许跨域
        this.image.onload = function () {
            _this.imageLoaded = 1
        }
        this.image.onerror = function () {
            _this.imageLoaded = -1
            throw new Error("体数据模型地址无效")
        }
    }

    /**
     * 将交互工具和体数据工具互相绑定<br>
     * 基于简单的发布/订阅模式，体数据范围更新的时候，会通知订阅者更新数据<br>
     * 使用此方法，不用关心手动去更新交互工具
     * @see this.update()
     * @param tools{Array.[_Common] | _Common} 实现了_Common的实例 或者实例数组
     */
    binding(tools){
        if(!Array.isArray(tools)){
            tools = [tools];
        }

        ///
        for(let i=0;i<tools.length;i++){
            let tool = tools[i]
            if(tool instanceof _Common){
                this.bindingCollection.push(tool)
                tool.binding(this)
            }else{
                throw Error("请传入实现_Comon接口的实例")
            }
        }
    }

    /**
     * 绑定事件
     * @param type 类型
     * @param handler 回调
     * @return {Number} 当前毫秒数，作为事件id ，移除事件的时候能用到
     * @example this.on("update",function(type,obj){})
     */
    on(type,handler){
        if(!type in this.handlers){
            this.handlers[type] = []
        }
        let id = Date().now()
        this.handlers[type].push({
            handler:handler,
            id:id
        })
        return id
    }

    /**
     * 移除事件
     * @param type 类型
     * @param id 事件id
     * @example this.off() 移除绑定在此对象上面的所有事件
     * @example this.off("update") 移除绑定在此对象上面的所有update事件
     * @example this.off("update",1123231231) 移除绑定在此对象上面的id为1123231231的update事件
     */
    off(type,id){
        if(!type){  //清除所有观察者
            this.handlers = {}
        }else if(!id){  //清除某一个类型的观察者
            this.handlers[type] = []
        }else if(this.handlers[type]){
            let events = this.handlers[type]
            for(let i = 0 ;i<events.length; i++){
                if(events[i].id === id){    //移除单个事件
                    events.splice(i,1)
                    break;
                }
            }
        }
    }

    /**
     * 触发事件
     * @param type 类型
     * @param obj 传递过去的参数
     * @example this.emit("update",{})
     */
    emit(type,obj){
        let events = this.handlers[type]
        for(let i = 0 ;i<events.length; i++){
            if(typeof events[i].handler === 'function'){
                events[i].handler(type,obj)
            }
        }
    }

    /**
     * 显示提数据
     */
    setVolume(){
        if(this.imageLoaded === 1){
            return this.mode === this.SURFACE ? this.setVolume_2() : this.setVolume_1()
        }else if(this.imageLoaded === 0){
            let arg = arguments
            setTimeout( ()=> {
                this.setVolume.apply(this,arg)
            },50)
        }
    }

    _createAppearance(mode, boxMin, boxMax, boxRadus, invMat) 
    {
        /// 
        const uniforms = {
            u_SliceNumXf: this._sliceNum[0],
            u_SliceNumYf: this._sliceNum[1],
            u_CubeTex: this.image,
            u_ColorTex: this._color,
            u_InvWorldMat : Cesium.Matrix4.toArray(invMat),
            u_VolBoxMin: boxMin,
            u_VolBoxMax:  boxMax,
            u_VolClipMin: new Cesium.Cartesian3(0.0,0.0,0.0),
            u_VolClipMax : new Cesium.Cartesian3(1.0, 1.0,1.0),
            u_VolBoxRadius: boxRadus,
            u_VolFilterLine: this._line,
        };

        /// 
        const isSlice = mode == MapVolume.RENDER_MODE_GLOBE_SLICE || mode == MapVolume.RENDER_MODE_BOX_SLICE;

        /// 
        const matShader = `#define ZMAP_MODE ${mode}\n\n#line 0` + this.shader.materialShader;

        // 创建材质
        const material = new Cesium.Material({
            translucent : true,
            fabric: {
                type: 'ZMapVolume',
                source: matShader,
                uniforms: uniforms
            }
        });

        const apoptions = {
            material: material,
            vertexShaderSource: this.shader.vertexShaderPass,
            fragmentShaderSource: this.shader.filterFragmentShaderPass,
            translucent : true,
            faceForward: true,
            closed: false,
            renderState: {
                cull : {
                    enabled : isSlice ? false : true,
                    face : Cesium.CullFace.BACK
                }
            }
        };

        /// 创建表现
        return new Cesium.MaterialAppearance(apoptions);
    }

    /**
     * 普通模型的渲染方式
     */
    setVolume_1() {
        let viewer = this._map.GetView();

        //计算参数
        let param = this._calcParam();
        let {deltaMaxH,deltaX,deltaY,deltaMinH} = param
        let matrix = param.cenMatrix;
        let invMatrixs = param.invCenMatrix;
        // 向shader传参
        
        /// 创建表现
        this._vol.apprance = this._createAppearance(MapVolume.RENDER_MODE_BOX, 
            new Cesium.Cartesian3(0, 0, 0),
            new Cesium.Cartesian3(deltaX, deltaY, deltaMaxH), 0, param.invCenMatrix);
        this._vol.mat = this._vol.apprance.material;

        // 代理几何体添加到指定经纬度场景
        const box = new Cesium.BoxGeometry({
            maximum: new Cesium.Cartesian3(deltaX, deltaY, deltaMaxH),
            minimum: new Cesium.Cartesian3(0.0, 0.0, deltaMinH)
        });

        this._vol.geom = Cesium.BoxGeometry.createGeometry(box);
        this._vol.pri && viewer.scene.primitives.remove(this._vol.pri)
        this._vol.pri = new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: this._vol.geom,
                debugShowBoundingVolume: true,
                modelMatrix: matrix,
                id: this._name
            }),
            asynchronous: false,
            appearance: this._vol.apprance
        });
        viewer.scene.primitives.add(this._vol.pri);
    }
    /**
     * 曲面模型的渲染方式
     */
    setVolume_2() {
        let viewer = this._map.GetView();

        //计算参数
        let param = this._calcParam();
        let {deltaMaxH,deltaX,deltaY,deltaMinH,deltalon,deltalat,deltaH,
            xmin,xmax,ymin,ymax,zmin,zmax,recDiagonal} = param;

        // 代理几何体添加到指定经纬度场景
        const rectangle = new Cesium.RectangleGeometry({
            rectangle : Cesium.Rectangle.fromDegrees(xmin, ymin, xmax, ymax),
            height: deltaMinH,
            extrudedHeight: deltaMaxH
        });

        ///
        this._vol.geom = Cesium.RectangleGeometry.createGeometry(rectangle);

        /// 创建表现
        this._vol.apprance = this._createAppearance(MapVolume.RENDER_MODE_GLOBE, 
            new Cesium.Cartesian3(xmin, ymin, zmin),
            new Cesium.Cartesian3(xmax, ymax, zmax), recDiagonal, param.invCenMatrix);
        this._vol.mat = this._vol.apprance.material;

        /// 移除旧的提数据对象
        this._vol.pri && viewer.scene.primitives.remove(this._vol.pri)
        /// 创建提数据Primitive
        this._vol.pri = new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: this._vol.geom,
                //debugShowBoundingVolume: true,
                // modelMatrix: matrix,
                id: this._name
            }),
            asynchronous: false,
            appearance: this._vol.apprance
        });

        ///
        viewer.scene.primitives.add(this._vol.pri);
    }

    setSlice(slice){
        const viewer = this._map.GetView();
        ///
        if (this._vol.pri) this._vol.pri.show = false;

        /// 删除旧的切面模型
        this._sectpri.forEach((pri,index) => {
            if(pri && pri.show !== false){
                viewer.scene.primitives.remove(pri)
                this._sectpri[index] = null;
            }
        });

        ///
        if(this.imageLoaded === 1){
            return this.mode === this.SURFACE ? this.setSlice_2(slice) : this.setSlice_1(slice);
        }else if(this.imageLoaded === 0){
            let arg = arguments
            setTimeout( ()=> {
                this.setSlice.apply(this,arg)
            },50)
        }
    }

    setSlice_1(slice){
        const viewer = this._map.GetView();

        //计算参数
        const param = this._calcParam();
        const {deltaMaxH,deltaX,deltaY,deltaH} = param

        const matrix = param.cenMatrix;

        /// 创建材质
        if (!this._sect.apprance)
        {
            this._sect.apprance = this._createAppearance(MapVolume.RENDER_MODE_BOX_SLICE, 
                new Cesium.Cartesian3(0, 0, 0),
                new Cesium.Cartesian3(deltaX, deltaY, deltaH), 0, param.invCenMatrix);
            this._sect.mat = this._sect.apprance.material;
        }

        ///
        const indices = new Uint32Array([0, 1, 3, 3, 2, 0]);

        //create buffer
        const slices = [];

        //为0的时候会报错，下同
        if (slice.x !== undefined)
        { 
            const _xSlice = slice.x * deltaX;
            slices[0] = ({
                position: new Float64Array([
                    _xSlice, 0.0, 0.0,
                    _xSlice, deltaY, 0.0,
                    _xSlice, 0.0, deltaH,
                    _xSlice, deltaY, deltaH
                ]),
                normal: new Float32Array([
                    0.0, 0.0, 1.0,
                    0.0, 0.0, 1.0,
                    0.0, 0.0, 1.0,
                    0.0, 0.0, 1.0,
                ]),
                name : 'lonSection'
            });
        }
        if(slice.y !== undefined){
            const _ySlice = slice.y * deltaY;

            slices[1] = ({
                position: new Float64Array([
                    0.0, _ySlice, 0.0,
                    deltaX, _ySlice, 0.0,
                    0.0, _ySlice, deltaH,
                    deltaX, _ySlice, deltaH
                ]),
                normal: new Float32Array([
                    0.0, 0.0, 1.0,
                    0.0, 0.0, 1.0,
                    0.0, 0.0, 1.0,
                    0.0, 0.0, 1.0,
                ]),
                name : 'latSection'
            });
        }
        if(slice.z !== undefined){
            const _zSlice = slice.z * deltaH;
            slices[2] = ({
                position: new Float64Array([
                    0.0, 0.0, _zSlice,
                    deltaX, 0.0, _zSlice,
                    0.0, deltaY, _zSlice,
                    deltaX, deltaY, _zSlice
                ]),
                normal: new Float32Array([
                    0.0, 0.0, 1.0,
                    0.0, 0.0, 1.0,
                    0.0, 0.0, 1.0,
                    0.0, 0.0, 1.0,
                ]),
                name : 'heiSection'
            });
        }

        ///
        for (let i = 0; i < slices.length; i++) 
        {
            const slice = slices[i];
            const attributes = new Cesium.GeometryAttributes();
            attributes.position = new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                componentsPerAttribute: 3,
                values: slice.position
            });

            attributes.normal = new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 3,
                values: slice.normal
            });

            const geo = new Cesium.Geometry({
                attributes: attributes,
                indices: indices,
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                boundingSphere: Cesium.BoundingSphere.fromVertices(slice.position),
            });
            const pri = new Cesium.Primitive({
                geometryInstances:new Cesium.GeometryInstance({
                    geometry: geo,
                    id: slice.name,
                    modelMatrix: matrix,
                }),
                asynchronous: false,
                appearance: this._sect.apprance
            });

            ///
            this._sectpri[i] = (pri);
            viewer.scene.primitives.add(pri);
        }

        ///
        this.sliceInited = true
    }
    setSlice_2(slice){
        const viewer = this._map.GetView();

        const param = this._calcParam();
        const {xmin,ymin,zmin,xmax, ymax,zmax} = param
        const target_x = xmin+slice.x*(xmax-xmin),
            target_y = ymin+slice.y*(ymax-ymin),
            target_z = zmin+slice.z*(zmax-zmin);

        /// 创建材质
        if (!this._sect.apprance)
        {
            this._sect.apprance = this._createAppearance(MapVolume.RENDER_MODE_GLOBE_SLICE, 
                new Cesium.Cartesian3(xmin, ymin, zmin),
                new Cesium.Cartesian3(xmax, ymax, zmax), 0, param.invCenMatrix);
            this._sect.mat = this._sect.apprance.material;
        }
        
        //create buffer
        const nameArray = ["lonSection", "latSection", "heiSection"];
        const geoArray = [null,null,null];

        // xslice
        if (!this._sectpri[0])
        {
            const xWall = Cesium.WallGeometry.fromConstantHeights({
                positions : Cesium.Cartesian3.fromDegreesArray([
                    target_x, ymin,
                    target_x, ymax,
                ]),
                minimumHeight : zmin,
                maximumHeight : zmax
            });

            ///
            geoArray[0] = Cesium.WallGeometry.createGeometry(xWall);
        }
        
        // yslice
        if (!this._sectpri[1])
        {
            const yWall = Cesium.WallGeometry.fromConstantHeights({
                positions : Cesium.Cartesian3.fromDegreesArray([
                    xmin, target_y,
                    xmax, target_y,
                ]),
                minimumHeight : zmin,
                maximumHeight : zmax
            });

            geoArray[1] = Cesium.WallGeometry.createGeometry(yWall);
        }
        
        // zslice
        if (!this._sectpri[2])
        {
            const zGeo = new Cesium.RectangleGeometry({
                rectangle: Cesium.Rectangle.fromDegrees(xmin,ymin,xmax,ymax),
                height: target_z,
            });
            geoArray[2] = Cesium.RectangleGeometry.createGeometry(zGeo);
        }
        
        //add slice primitive
        for (let i = 0; i < 3; i++) 
        {
            if (!this._sectpri[i])
            {
                const pri = new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: geoArray[i],
                        id: nameArray[i],
                        attributes : {
                            color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.TRANSPARENT)
                        },
                    }),
                    asynchronous: false,
                    appearance: this._sect.apprance
                });
                this._sectpri[i] = pri;
                viewer.scene.primitives.add(pri);
            }
        }

        this.sliceInited = true
    }

    reset() {
        this._scale = [1, 1, 1];
        this._offset = [0, 0, 0];
        return this.refresh();
    }

    refresh() {
        this.showVolume();
        return;
    }

    showVolume() {
        this.setVolume();
        this.visible = true;
    }

    destroy() {
        let viewer = this._map.GetView();
        let pris = viewer.scene.primitives;
        if (this._vol.pri) {
            pris.remove(this._vol.pri);
            //this._vol.pri && this._vol.pri.destroy();
            this._vol.pri = null;
        }
        this._sectpri.forEach(pri =>{
            pris.remove(pri)
        });
        this._sectpri = [];
        this.sliceInited = false;
        return;
    }

    set colorMap(colorMap){
        if (this._vol.pri) {
            let pri = this._vol.pri;
            // let uni = Object.assign(pri.appearance.material.uniforms,uniforms)
            pri.appearance.material.uniforms.u_ColorTex = colorMap
        }
        return colorMap
    }
    /**
     * 设置属性过滤
     * @param open {boolean} 是否开启属性过滤
     */
    set filter(open){
        if(open){
            this.filterControl && (this.filterControl.element.style.visibility = "visible")
        }else{
            this.filterControl && (this.filterControl.element.style.visibility = "hidden")
        }
        this._filterOpen = open
    }
    get filter(){
        return this._filterOpen
    }

    /**
     * 统一minHei,minLng,minLat,maxHei,maxLng,maxLat方法
     * @param uniforms {Object} 包含以下属性：[minHeight,minLongitude,minLatitude,maxHeight,maxLongitude,maxLatitude]等
     * @see minHei
     * @see minLng
     * @see minLat
     * @see maxHei
     * @see maxLng
     * @see maxLat
     */
    set range(ranges){
        if (this._vol.mat) {
            const uniforms = this._vol.mat.uniforms;
            // let uni = Object.assign(pri.appearance.material.uniforms,uniforms)

            let {zmin,deltaH,deltaX,deltaY} = this._calcParam()
            let keep = function(val){   //keep the value in [0,1]
                return Number(Math.max(Math.min(val,0.9999999),0.000001).toFixed(6))
            }
            
            uniforms.u_VolClipMin = new Cesium.Cartesian3(keep(ranges.minLongitude/deltaX),keep(ranges.minLatitude/deltaY),keep((ranges.minHeight-zmin)/deltaH));
            uniforms.u_VolClipMax = new Cesium.Cartesian3(keep(ranges.maxLongitude/deltaX),keep(ranges.maxLatitude/deltaY) ,keep((ranges.maxHeight-zmin)/deltaH));
        }
    }

    SetOffset(arr) {
        this._offset = arr;
        this.refresh();
    }

    _calcScaleOffsetBox() {
        let newBox = {}, box = this._box, offset = this._offset, scale = this._scale;
        let xoffset = offset[0], yoffset = offset[1], zoffset = offset[2];
        let xscale = scale[0], yscale = scale[1], zscale = scale[2];

        //x
        newBox.xmin = xoffset + box.xmin * xscale;
        newBox.xmax = xoffset + box.xmax * xscale;

        //y
        newBox.ymin = yoffset + box.ymin * yscale;
        newBox.ymax = yoffset + box.ymax * yscale;

        //z
        newBox.zmin = zoffset + box.zmin * zscale;
        newBox.zmax = zoffset + box.zmax * zscale;

        return newBox;
    }

    _getModelMatrix() {
        return this._vol.pri.modelMatrix;
    }

    _setModelMatrix(mat) {
        this._vol.pri.modelMatrix = mat;

    }

    SetModelMatrix(value, priName) {
        if (priName == undefined) {
            this._vol.pri.modelMatrix = this.CalculateMatrix(value);
        } else {
            let priobj = this.getSecPri(priName);
            priobj.modelMatrix = this.CalculateMatrix(value);
        }

    }

    CalculateMatrix(input) {
        let output = Cesium.Matrix4.multiplyByTranslation(Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(input[0], input[1], input[2])), new Cesium.Cartesian3(0.0, 0.0, 0.0), new Cesium.Matrix4());
        return output;
    }

    _calcModelMatrix() {
        let offset = this._offset, scale = this._scale;

        let copyMat = new Cesium.Matrix4();


        //
        let box = this._box;
        let xcen = (box.xmin + box.xmax) / 2;
        let ycen = (box.ymin + box.ymin) / 2;

        //offset
        let trs = new Cesium.TranslationRotationScale();
        //trs.translation = Cesium.Cartesian3.fromDegrees(0, 0, 0);

        //rotate
        let hpr = Cesium.HeadingPitchRoll.fromDegrees(0.0, 0.0, 0.0, new Cesium.HeadingPitchRoll());
        trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, new Cesium.Quaternion());

        //scale
        trs.scale = Cesium.Cartesian3.fromElements(scale[0], scale[1], scale[2], new Cesium.Cartesian3())

        return Cesium.Matrix4.fromTranslationRotationScale(trs, new Cesium.Matrix4());
    }

    _calcParam() {
        let scale = this._scale;
        let offset = this._offset;
        let box = this._calcScaleOffsetBox();


        //经纬度单位计算
        let xcen = (box.xmin + box.xmax) / 2;
        let ycen = (box.ymin + box.ymax) / 2;
        let zcen = (box.zmin + box.zmax) / 2;
        let deltaH = box.zmax - box.zmin;
        let deltaMinH = box.zmin;
        let deltaMaxH = box.zmax;
        let deltalon = box.xmax - box.xmin;
        let deltalat = box.ymax - box.ymin;

        // 求指定经纬度所代表的长宽范围
        let a = Cesium.Cartesian3.fromDegrees(box.xmin, box.ymax, deltaMinH);
        let c = Cesium.Cartesian3.fromDegrees(box.xmin, box.ymin, deltaMinH);
        let d = Cesium.Cartesian3.fromDegrees(box.xmax, box.ymax, deltaMinH);

        //跨度
        let deltaX = Math.sqrt((d.x - a.x) * (d.x - a.x) + (d.y - a.y) * (d.y - a.y) + (d.z - a.z) * (d.z - a.z));
        let deltaY = Math.sqrt((c.x - a.x) * (c.x - a.x) + (c.y - a.y) * (c.y - a.y) + (c.z - a.z) * (c.z - a.z));
        let recDiagonal = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // 求Cen几何体变换矩阵的逆矩阵
        let cenMatrix = Cesium.Matrix4.multiplyByTranslation(Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(box.xmin, box.ymin, deltaMinH)),
            new Cesium.Cartesian3(0.0, 0.0, 0.0), new Cesium.Matrix4());
        let invCenMatrixs = new Cesium.Matrix4();
        invCenMatrixs = Cesium.Matrix4.inverse(cenMatrix, invCenMatrixs);


        //平移
        return {
            xmin: box.xmin,
            xmax: box.xmax,
            ymin: box.ymin,
            ymax: box.ymax,
            zmin: box.zmin,
            zmax: box.zmax,
            xcen: xcen,
            ycen: ycen,
            zcen: zcen,
            deltalon: deltalon,
            deltalat: deltalat,
            deltaH: deltaH,
            deltaMinH: deltaMinH,
            deltaMaxH: deltaMaxH,
            a: a,
            c: c,
            d: d,
            deltaX: deltaX,
            deltaY: deltaY,
            cenMatrix: cenMatrix,
            invCenMatrix: invCenMatrixs,
            from:{
                longitude:box.xmin,
                latitude:box.ymin,
                height:box.zmin
            },
            to:{
                longitude:box.xmax,
                latitude:box.ymax,
                height:box.zmax
            },
            recDiagonal:recDiagonal,
        };
    }

    getSecPri(name) {
        let secpriArr = this._sectpri;
        let secpri = null;
        for (let i = 0; i < secpriArr.length; i++) {
            if ((secpriArr[i]._instanceIds)[0] == name) {
                secpri = secpriArr[i];
                break;
            }
        }
        return secpri;
    }

}

///绘制模式
MapVolume.RENDER_MODE_GLOBE = 1;
MapVolume.RENDER_MODE_GLOBE_SLICE = 2;
MapVolume.RENDER_MODE_BOX = 3;
MapVolume.RENDER_MODE_BOX_SLICE = 4;


/*
 * param参数 *为空则为默认值
 * name_X:x轴名称
 * split_X:x轴分段数
 * max_X:x轴最大值
 * min_X:x轴最小值
 * tolerance:点击容差
 * ...
 * line:二维数组,[[x1,y1],[x2,y2],...]
 * */
class FilterEdit {
    constructor(element,param){
        if(!element instanceof Element){
            throw new Error("请传入一个正确的页面元素")
        }
        this.element = element
        this.param = Object.assign({
            name_X: "属性值",
            split_X: 4,
            max_X: 1000,
            min_X: 0,
            name_Y: "透明度",
            split_Y: 5,
            max_Y: 1000,
            min_Y: 0,
            olerance: 3,
            bkColor: "#22344C",
            axisColor: "#C6CDCC",
            lineColor: "#FF0000",
            fontColor: "#C6CDCC",
            textSpace: 2,
        },param)
        for(let key in this.param){
            this["_"+key] = this.param[key]
        }
        this._line = this.param.line ? this.param.line : [[0,0],[this._max_X,this._max_Y]];

        this._init(this.element)
    }

    _init(div) {
        this.x_axis = 30;
        this.y_axis = 40;
        this._width = div.offsetWidth;
        this._height = div.offsetHeight;
        this.painter = document.createElement('canvas');
        this.painter.width = this._width;
        this.painter.height = this._height;
        let lbtn_down = 0;
        let thisobj = this;
        let point_line;
        this.parse_line();
        let highlight_status = -1;
        this.painter.addEventListener('mousedown', function (e) {

            if (point_line.relation == 1)
                lbtn_down = 1;
            else if (point_line.relation == 2) {
                //插入点
                thisobj.trans_line.splice(point_line.position, 0, point_line.point);
                lbtn_down = 1;
                highlight_status = point_line.position;
                thisobj._draw(highlight_status);
                thisobj.reverse_parse_line();
            }
        })
        this.painter.addEventListener('mousemove', e=> {
            if (lbtn_down == 1) {
                let yposition;
                if (e.offsetY <= 50)
                    yposition = 50;
                else if (e.offsetY > thisobj._height - thisobj.x_axis)
                    yposition = thisobj._height - thisobj.x_axis;
                else
                    yposition = e.offsetY;

                if (point_line.position == 0)
                    thisobj.trans_line[point_line.position] = [thisobj.y_axis, yposition];
                else if (point_line.position == thisobj.trans_line.length - 1)
                    thisobj.trans_line[point_line.position] = [thisobj._width - 50, yposition];
                else {
                    thisobj.trans_line[point_line.position] = [e.offsetX, yposition];

                    for (let i = 1; i < thisobj.trans_line.length - 1 - point_line.position; i++) {
                        if (thisobj.trans_line[point_line.position + i][0] <= e.offsetX)
                            thisobj.trans_line[point_line.position + i][0] = e.offsetX;
                    }
                    for (let i = 0; i < point_line.position; i++) {
                        if (thisobj.trans_line[i][0] >= e.offsetX)
                            thisobj.trans_line[i][0] = e.offsetX;
                    }
                    if (e.offsetX >= thisobj._width - 50) {
                        thisobj.trans_line.splice(point_line.position + 1, thisobj.trans_line.length - 1 - point_line.position);
                        thisobj.trans_line[point_line.position] = [thisobj._width - 50, yposition];
                    }
                    if (e.offsetX <= thisobj.y_axis) {
                        thisobj.trans_line.splice(0, point_line.position);
                        point_line.position = 0;
                        thisobj.trans_line[0] = [thisobj.y_axis, yposition];
                    }
                }
                highlight_status = point_line.position;
                thisobj._draw(point_line.position);
                thisobj.reverse_parse_line();
                thisobj.onchangestatus(point_line.position, thisobj._line);
            }
            else {
                //mouseon
                let point = [e.offsetX, e.offsetY];
                point_line = this.relation(point, thisobj.trans_line, thisobj._tolerance);

                if (point_line.relation == 1) {
                    thisobj.highlight(point_line.position);
                    highlight_status = point_line.position;
                }
                else {
                    if (highlight_status >= 0) {
                        thisobj._draw();
                        highlight_status = -1;
                    }
                }
            }
        })
        this.painter.addEventListener('mouseup', function (e) {
            if (lbtn_down == 1) {
                lbtn_down = 0;
                thisobj.onchangestatus_over(point_line.position, thisobj._line);
            }
        })
        this.painter.addEventListener('mouseout', function (e) {
            if (lbtn_down == 1) {
                lbtn_down = 0;
                thisobj.onchangestatus_over(point_line.position, thisobj._line);
            }
        })
        div.appendChild(this.painter);

        this._draw()
    }

    _reset() {
        this._line = [[0, 0], [this._max_X, this._max_Y]];
        this.parse_line();
        this._draw();
    }

    _resetMax() {
        this._line = [[0, this._max_Y], [this._max_X, this._max_Y]];
        this.parse_line();
        this._draw();
    }

    _resetPoints(points) {
        this._line = points;//[[0, this._max_Y], [this._max_X, this._max_Y]];
        this.parse_line();
        this._draw();
    }

    _draw(i) {
        this.clearCanvas();
        this._draw_arrow();
        this._draw_line(i);
    }

    _draw_arrow() {
        let context = this.painter.getContext("2d");
        context.beginPath();
        context.lineWidth = "1";
        context.strokeStyle = this._axisColor;
        context.font = "10px Courier New";
        context.fillStyle = this._fontColor;
        //y
        context.moveTo(this.y_axis, this._height - this.x_axis);
        context.lineTo(this.y_axis, 30);
        context.lineTo(this.y_axis - 4, 34);
        context.moveTo(this.y_axis, 30);
        context.lineTo(this.y_axis + 4, 34);
        //x
        context.moveTo(this.y_axis, this._height - this.x_axis);
        context.lineTo(this._width - 30, this._height - this.x_axis);
        context.lineTo(this._width - 34, this._height - this.x_axis - 4);
        context.moveTo(this._width - 30, this._height - this.x_axis);
        context.lineTo(this._width - 34, this._height - this.x_axis + 4);
        //x刻度
        let cell_x = (this._width - 50 - this.y_axis) / this._split_X;
        let cell_x_value = ((this._max_X - this._min_X) / this._split_X).toFixed(0);
        for (let i = 1; i <= this._split_X; i++) {
            context.moveTo(cell_x * i + this.y_axis, this._height - this.x_axis);
            if (i % this._textSpace == 1) {
                //画长标签
                context.lineTo(cell_x * i + this.y_axis, this._height - this.x_axis + 5);
                context.fillText(this._min_X + cell_x_value * i, cell_x * i + this.y_axis - 5, this._height - this.x_axis + 15);
            }
            else {
                //画短标签
                context.lineTo(cell_x * i + this.y_axis, this._height - this.x_axis + 3);
            }
        }
        context.moveTo(this._width - 50, this._height - 30);
        context.lineTo(this._width - 50, 50);
        context.fillText(this._name_X, this._width - 45, this._height - this.x_axis - 11);
        context.fillText(this._name_Y, this.y_axis - 15, 30);
        context.stroke();
        context.beginPath();
        //y刻度
        context.strokeStyle = this._axisColor;
        context.lineWidth = "1";
        let cell_y = (this._height - this.x_axis - 50) / this._split_Y;
        let cell_y_value = ((this._max_Y - this._min_Y) / this._split_Y).toFixed(0);
        for (let i = 0; i < this._split_Y; i++) {
            context.moveTo(this.y_axis, cell_y * i + 50);
            context.lineTo(this._width - 50, cell_y * i + 50);
            context.fillText(this._max_Y - cell_y_value * i, this.y_axis - 30, cell_y * i + 53);
        }
        context.stroke();
    }

    _draw_line(position) {
        let context = this.painter.getContext("2d");

        context.lineWidth = "1";
        context.strokeStyle = this._lineColor;
        context.beginPath();
        context.moveTo(this.trans_line[0][0], this.trans_line[0][1]);
        for (let i = 1; i < this.trans_line.length; i++) {
            context.lineTo(this.trans_line[i][0], this.trans_line[i][1]);
        }
        context.stroke();

        context.lineWidth = "1";
        context.fillStyle = this._lineColor;
        for (let i = 0; i < this.trans_line.length; i++) {
            context.beginPath();
            context.arc(this.trans_line[i][0], this.trans_line[i][1], 4, 0, Math.PI * 2);
            context.fill();
        }
        if (position) {
            this.highlight(position);
        }
    }

    highlight(i) {
        let context = this.painter.getContext("2d");
        context.lineWidth = "1";
        context.fillStyle = this._lineColor;
        context.beginPath();
        context.arc(this.trans_line[i][0], this.trans_line[i][1], 5, 0, Math.PI * 2);
        context.fill();
    }

    clearCanvas() {
        let context = this.painter.getContext("2d");
        context.beginPath();
        context.fillStyle = this._bkColor;
        context.fillRect(0, 0, this._width, this._height);
        context.closePath();
    }

    parse_line() {
        this.trans_line = [];
        for (let i = 0; i < this._line.length; i++) {
            let re = [];
            re[0] = (this._line[i][0] - this._min_X) / (this._max_X - this._min_X) * (this._width - this.y_axis - 50) + this.y_axis;
            re[1] = this._height - this.x_axis - ((this._line[i][1] - this._min_Y) / (this._max_Y - this._min_Y) * (this._height - this.x_axis - 50));
            this.trans_line.push(re);
        }

    }

    reverse_parse_line() {
        this._line = [];
        for (let i = 0; i < this.trans_line.length; i++) {
            let re = [];
            re[0] = ((this.trans_line[i][0] - this.y_axis) / (this._width - this.y_axis - 50) * (this._max_X - this._min_X) + this._min_X).toFixed(1);
            re[1] = ((this._height - this.x_axis - this.trans_line[i][1]) / (this._height - this.x_axis - 50) * (this._max_Y - this._min_Y) + this._min_Y).toFixed(1);
            this._line.push(re);
        }

    }

    onchangestatus() {

    }

    onchangestatus_over() {

    }

    relation(point, line, tole) {
        let obj = {};
        for (let i = 0; i < line.length; i++) {
            if (this.pp_distance(point, line[i]) <= tole + 2) {
                obj.relation = 1;
                obj.position = i;
                return obj;
            }
        }
        for (let i = 0; i < line.length - 1; i++) {
            if (this.pointLine_Disp(point[0], point[1], line[i][0], line[i][1], line[i + 1][0], line[i + 1][1]) <= tole) {
                obj.relation = 2;
                obj.point = point;
                obj.position = i + 1;
                return obj;
            }
        }
        obj.relation = 0;
        return obj;
    }

    pp_distance(point1, point2) {
        let xdiff = point1[0] - point2[0];            // 计算两个点的横坐标之差
        let ydiff = point1[1] - point2[1];
        return Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5);
    }

    pointLine_Disp(xx, yy, x1, y1, x2, y2) {
        let a, b, c, ang1, ang2, ang, m;
        let result = 0;
        //分别计算三条边的长度
        a = Math.sqrt((x1 - xx) * (x1 - xx) + (y1 - yy) * (y1 - yy));
        if (a == 0)
            return -1;
        b = Math.sqrt((x2 - xx) * (x2 - xx) + (y2 - yy) * (y2 - yy));
        if (b == 0)
            return -1;
        c = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        //如果线段是一个点则退出函数并返回距离
        if (c == 0) {
            result = a;
            return result;
        }
        //如果点(xx,yy到点x1,y1)这条边短
        if (a < b) {
            //如果直线段AB是水平线。得到直线段AB的弧度
            if (y1 == y2) {
                if (x1 < x2)
                    ang1 = 0;
                else
                    ang1 = Math.PI;
            }
            else {
                m = (x2 - x1) / c;
                if (m - 1 > 0.00001)
                    m = 1;
                ang1 = Math.acos(m);
                if (y1 > y2)
                    ang1 = Math.PI * 2 - ang1;//直线(x1,y1)-(x2,y2)与折X轴正向夹角的弧度
            }
            m = (xx - x1) / a;
            if (m - 1 > 0.00001)
                m = 1;
            ang2 = Math.acos(m);
            if (y1 > yy)
                ang2 = Math.PI * 2 - ang2;//直线(x1,y1)-(xx,yy)与折X轴正向夹角的弧度

            ang = ang2 - ang1;
            if (ang < 0) ang = -ang;

            if (ang > Math.PI) ang = Math.PI * 2 - ang;
            //如果是钝角则直接返回距离
            if (ang > Math.PI / 2)
                return a;
            else
                return a * Math.sin(ang);
        }
        else//如果(xx,yy)到点(x2,y2)这条边较短
        {
            //如果两个点的纵坐标相同，则直接得到直线斜率的弧度
            if (y1 == y2)
                if (x1 < x2)
                    ang1 = Math.PI;
                else
                    ang1 = 0;
            else {
                m = (x1 - x2) / c;
                if (m - 1 > 0.00001)
                    m = 1;
                ang1 = Math.acos(m);
                if (y2 > y1)
                    ang1 = Math.PI * 2 - ang1;
            }
            m = (xx - x2) / b;
            if (m - 1 > 0.00001)
                m = 1;
            ang2 = Math.acos(m);//直线(x2-x1)-(xx,yy)斜率的弧度
            if (y2 > yy)
                ang2 = Math.PI * 2 - ang2;
            ang = ang2 - ang1;
            if (ang < 0) ang = -ang;
            if (ang > Math.PI) ang = Math.PI * 2 - ang;//交角的大小
            //如果是对角则直接返回距离
            if (ang > Math.PI / 2)
                return b;
            else
                return b * Math.sin(ang);//如果是锐角，返回计算得到的距离
        }
    }
}
