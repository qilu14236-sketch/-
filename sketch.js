let video;
let facemesh;
let handpose;
let facePredictions = [];
let handPredictions = [];
let earringImgs = [];
let currentEarringImg;
let maskImg;

function preload() {
  // 初始化 ml5.faceMesh 模型 (注意大小寫)
  facemesh = ml5.faceMesh();
  // 初始化 ml5.handPose 模型
  handpose = ml5.handPose();
  
  // 載入 5 張耳環圖片
  for (let i = 1; i <= 5; i++) {
    earringImgs.push(loadImage(`pic/acc${i}_ring.png`));
  }
  
  // 載入面具圖片
  maskImg = loadImage('pic/mask2_blue.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide();
  
  currentEarringImg = earringImgs[0]; // 預設顯示第一張耳環圖片
  
  // 開始偵測臉部特徵
  facemesh.detectStart(video, results => {
    facePredictions = results;
  });
  
  // 開始偵測手部特徵
  handpose.detectStart(video, results => {
    handPredictions = results;
  });
}

function draw() {
  background('#e7c6ff');
  
  let imgW = windowWidth * 0.5;
  let imgH = windowHeight * 0.5;
  
  // -- 手勢辨識與耳環切換邏輯 --
  if (handPredictions.length > 0) {
    let hand = handPredictions[0];
    let count = 0;
    
    // 定義五根手指的指尖(Tip)與根部關節(Base)的索引值
    let fingers = [
      { tip: 4, base: 2 },   // 大拇指
      { tip: 8, base: 6 },   // 食指
      { tip: 12, base: 10 }, // 中指
      { tip: 16, base: 14 }, // 無名指
      { tip: 20, base: 18 }  // 小拇指
    ];
    
    let wrist = hand.keypoints[0]; // 節點0 為手腕位置
    
    // 透過計算手腕到指尖與關節的距離，來判斷手指是否伸直
    for (let i = 0; i < fingers.length; i++) {
      let tip = hand.keypoints[fingers[i].tip];
      let base = hand.keypoints[fingers[i].base];
      
      let dTip = dist(wrist.x, wrist.y, tip.x, tip.y);
      let dBase = dist(wrist.x, wrist.y, base.x, base.y);
      
      // 指尖距離大於關節距離一定比例，判定為伸直
      if (dTip > dBase * 1.2) {
        count++;
      }
    }
    
    // 如果偵測到的手指數量在 1 ~ 5 之間，切換對應的耳環圖片
    if (count >= 1 && count <= 5) {
      currentEarringImg = earringImgs[count - 1];
    }
  }

  push();
  translate(windowWidth / 2, windowHeight / 2); // 將原點移到視窗正中心
  scale(-1, 1); // X 軸縮放 -1 來達成左右顛倒
  imageMode(CENTER); // 圖片繪製模式設為中心點
  image(video, 0, 0, imgW, imgH); // 繪製影片，寬高為視窗的 50%
  
  // 如果模型有辨識到臉部，且影片已經載入尺寸
  if (facePredictions.length > 0 && video.width > 0) {
    let keypoints = facePredictions[0].keypoints;
    
    // 取得臉部中心(鼻尖)與臉部邊界特徵點來計算面具大小與位置
    let nose = keypoints[1];
    let faceLeft = keypoints[234];
    let faceRight = keypoints[454];
    let faceTop = keypoints[10];
    let faceBottom = keypoints[152];
    
    let maskX = map(nose.x, 0, video.width, -imgW / 2, imgW / 2);
    let maskY = map(nose.y, 0, video.height, -imgH / 2, imgH / 2);
    let faceW = dist(faceLeft.x, faceLeft.y, faceRight.x, faceRight.y) * (imgW / video.width);
    let faceH = dist(faceTop.x, faceTop.y, faceBottom.x, faceBottom.y) * (imgH / video.height);
    
    // 繪製面具圖片，稍微放大 (1.3 倍) 以確保能完全覆蓋整張臉
    image(maskImg, maskX, maskY, faceW * 1.3, faceH * 1.3);
    
    // 在 Facemesh 468 個特徵點中，177 與 401 約為左右耳垂底部的邊緣位置
    let leftEarlobe = keypoints[177];
    let rightEarlobe = keypoints[401];
    
    // 將辨識到的原始座標對應到目前 50% 縮放且置中的畫面座標
    let leftX = map(leftEarlobe.x, 0, video.width, -imgW / 2, imgW / 2);
    let leftY = map(leftEarlobe.y, 0, video.height, -imgH / 2, imgH / 2);
    let rightX = map(rightEarlobe.x, 0, video.width, -imgW / 2, imgW / 2);
    let rightY = map(rightEarlobe.y, 0, video.height, -imgH / 2, imgH / 2);
    
    // 繪製耳環圖片 (設定顯示寬高為 40x40，可依您圖片的實際比例進行修改)
    image(currentEarringImg, leftX, leftY, 40, 40); 
    image(currentEarringImg, rightX, rightY, 40, 40); 
  }
  
  pop();
  
  // 在影像上方顯示文字 (不受 scale(-1, 1) 影響，所以文字不會反向)
  fill(0); // 設定文字顏色為黑色
  noStroke();
  textSize(32); // 設定文字大小
  textAlign(CENTER, BOTTOM); // 對齊基準點設為水平置中、垂直靠下
  text('414730225陳怜安', windowWidth / 2, windowHeight / 2 - imgH / 2 - 10);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
