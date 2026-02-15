import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders portfolio headings and action buttons', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /welcome to my portfolio!/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /thanks for visiting!/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /intro/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /work/i })).toBeInTheDocument();
});

test('renders about content and work highlights table', async () => {
  render(<App />);

  await userEvent.click(screen.getByRole('button', { name: /work/i }));
  expect(screen.getByRole('heading', { name: /about me/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /work highlights/i })).toBeInTheDocument();
  expect(
    screen.getByText(/software systems that bridge low-level engineering/i)
  ).toBeInTheDocument();
});
