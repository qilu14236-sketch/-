let video;
let facemesh;
let predictions = [];
let earringImg;

function preload() {
  // 初始化 ml5.faceMesh 模型 (注意大小寫)
  facemesh = ml5.faceMesh();
  // 載入耳環圖片
  earringImg = loadImage('pic/acc1_ring.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide();
  
  // 開始偵測臉部特徵，當有辨識結果時，將結果存入 predictions 陣列
  facemesh.detectStart(video, results => {
    predictions = results;
  });
}

function draw() {
  background('#e7c6ff');
  
  let imgW = windowWidth * 0.5;
  let imgH = windowHeight * 0.5;
  
  push();
  translate(windowWidth / 2, windowHeight / 2); // 將原點移到視窗正中心
  scale(-1, 1); // X 軸縮放 -1 來達成左右顛倒
  imageMode(CENTER); // 圖片繪製模式設為中心點
  image(video, 0, 0, imgW, imgH); // 繪製影片，寬高為視窗的 50%
  
  // 如果模型有辨識到臉部，且影片已經載入尺寸
  if (predictions.length > 0 && video.width > 0) {
    let keypoints = predictions[0].keypoints;
    
    // 在 Facemesh 468 個特徵點中，177 與 401 約為左右耳垂底部的邊緣位置
    let leftEarlobe = keypoints[177];
    let rightEarlobe = keypoints[401];
    
    // 將辨識到的原始座標對應到目前 50% 縮放且置中的畫面座標
    let leftX = map(leftEarlobe.x, 0, video.width, -imgW / 2, imgW / 2);
    let leftY = map(leftEarlobe.y, 0, video.height, -imgH / 2, imgH / 2);
    let rightX = map(rightEarlobe.x, 0, video.width, -imgW / 2, imgW / 2);
    let rightY = map(rightEarlobe.y, 0, video.height, -imgH / 2, imgH / 2);
    
    // 繪製耳環圖片 (設定顯示寬高為 40x40，可依您圖片的實際比例進行修改)
    image(earringImg, leftX, leftY, 40, 40); 
    image(earringImg, rightX, rightY, 40, 40); 
  }
  
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
