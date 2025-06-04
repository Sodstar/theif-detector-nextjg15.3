import {throttle} from "lodash";

export const renderPredictions = (predictions, ctx) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Fonts
  const font = "16px 'Inter', sans-serif";
  ctx.font = font;
  ctx.textBaseline = "top";

  predictions.forEach((prediction) => {
    const [x, y, width, height] = prediction["bbox"];
    const isPerson = prediction.class === "person";
    
    // Calculate confidence percentage
    const confidenceScore = (prediction.score * 100).toFixed(1);

    // Modern bounding box with rounded corners
    ctx.lineWidth = 3;
    ctx.strokeStyle = isPerson ? "rgba(255, 0, 128, 0.8)" : "#00FFFF";
    
    // Draw rounded rectangle
    const radius = 8;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();

    // Gradient fill for the detection area
    if (isPerson) {
      const gradient = ctx.createLinearGradient(x, y, x, y + height);
      gradient.addColorStop(0, "rgba(255, 0, 128, 0.1)");
      gradient.addColorStop(1, "rgba(255, 0, 128, 0.2)");
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw the label with modern style
    const label = `${prediction.class} ${confidenceScore}%`;
    const textWidth = ctx.measureText(label).width;
    const textHeight = 24;
    const padding = 8;
    
    // Label background with rounded corners
    ctx.fillStyle = isPerson ? "rgba(255, 0, 128, 0.85)" : "rgba(0, 255, 255, 0.85)";
    roundRect(ctx, x, y - textHeight - padding, textWidth + padding * 2, textHeight + padding, 6, true, false);
    
    // Label text
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(label, x + padding, y - textHeight - padding / 2);

    if (isPerson) {
      playAudio();
    }
  });
};

// Helper function to draw rounded rectangles
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}

const playAudio = throttle(() => {
  const audio = new Audio("/alarm.wav");
  audio.volume = 0.7;  // Reduce volume slightly
  audio.play();
}, 2000);