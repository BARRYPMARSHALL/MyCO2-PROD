
import MersenneTwister from 'mersenne-twister';

const generator = new MersenneTwister();

export const random = () => generator.random();

export const randomInt = (min, max) => {
  return Math.floor(generator.random() * (max - min + 1)) + min;
};

export const createRNG = (seed) => {
  return new MersenneTwister(seed);
};