import { render, screen } from '@testing-library/react';

import { sampleReport } from '@/mocks/convert/fixtures';

import { GateStatus, ReportSummary } from './ReportSummary';

describe('ReportSummary', () => {
  it('shows decision counts, gates and run details', () => {
    render(<ReportSummary report={sampleReport('run-1')} />);
    expect(screen.getByText('Needs review').nextSibling).toHaveTextContent('7');
    expect(screen.getByText('Passed')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Skipped')).toBeInTheDocument();
    expect(screen.getByText(/213 rules run · 5 findings/)).toBeInTheDocument();
    expect(screen.getByText('run-1')).toBeInTheDocument();
  });

  it('labels a gate that errored without a verdict', () => {
    render(<GateStatus gate={{ error: 'boom' }} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
