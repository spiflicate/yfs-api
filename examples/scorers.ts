const scoresText = await Bun.file('./scores.txt').text();

const scores = scoresText.split('\n').map((line) => Number(line.trim()));

console.log();

const averageScore =
   scores.reduce((sum, score) => sum + score, 0) / scores.length;

console.log(`Average Score: ${averageScore.toFixed(2)}`);

const maxScore = Math.max(...scores);
const minScore = Math.min(...scores);

console.log(`Max Score: ${maxScore}`);
console.log(`Min Score: ${minScore}`);

const scoreRange = maxScore - minScore;

console.log(`Score Range: ${scoreRange.toFixed(2)}`);

const medianScore = scores.sort((a, b) => a - b)[
   Math.floor(scores.length / 2)
];

console.log(`Median Score: ${medianScore?.toFixed(2)}`);

const variance =
   scores.reduce((sum, score) => sum + (score - averageScore) ** 2, 0) /
   scores.length;

console.log(`Variance: ${variance.toFixed(2)}`);

const standardDeviation = Math.sqrt(variance);

console.log(`Standard Deviation: ${standardDeviation.toFixed(2)}`);

console.log();

console.log('Top 10 Scores:');

scores
   .sort((a, b) => b - a)
   .slice(0, 10)
   .forEach((score, index) => {
      console.log(
         `${(index + 1).toString().padStart(2, ' ')}. ${score.toFixed(2)}`,
      );
   });

console.log();

console.log('Bottom 10 Scores:');

scores
   .sort((a, b) => a - b)
   .slice(0, 10)
   .sort((a, b) => b - a)
   .forEach((score, index) => {
      console.log(
         `${(scores.length - 10 + index + 1).toString().padStart(2, ' ')}. ${score.toFixed(2)}`,
      );
   });
