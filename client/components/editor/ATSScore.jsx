export default function ATSScore({ score }) {
  const getColor = (score) => {
    if (score <= 30) return '#f02a2a';
    if (score <= 50) return '#ff9800';
    if (score <= 70) return '#7ce980';
    if (score <= 89)  return 'rgb(143,86,232)'
    return 'conic-gradient(from 90deg at 50% 50%, #fb4a1d 0%, #f48164 22%, #e7439d 48%, #6684ff 69.5%, #843bf8 87%, #a03cf8 100%)'; 
  };

  const scoreColor = getColor(score);

  return (
      <div className="score-container left-1">
        <div className="circle">
          <div
            className="circle-fill"
            style={{
              background: score > 89 ? scoreColor : `conic-gradient(${scoreColor} ${score}%, #e0e0e0 ${score}%)`,
            }}
          />
          <div className="inner-circle">
            <div className={`percentage ${score > 89 ?'text-gradient': ''}`}
            style={{ color: score > 89 ? '' : scoreColor }}
            >{score}%</div>
          </div>
        </div>
        <p className="text-primary font-semibold">ATS SCORE</p>
      </div>
  );
}