import { describe, it, expect } from "vitest";
import {
  formatMillions,
  formatPercent,
  formatMultiple,
  formatIRR,
  formatDollar,
} from "../formatting";

describe("formatMillions", () => {
  it("formats values under 1B as $M", () => {
    expect(formatMillions(100)).toBe("$100.0M");
  });

  it("formats values >= 1B as $B", () => {
    expect(formatMillions(1500)).toBe("$1.5B");
  });

  it("formats exactly 1000 as $1.0B", () => {
    expect(formatMillions(1000)).toBe("$1.0B");
  });

  it("handles zero", () => {
    expect(formatMillions(0)).toBe("$0.0M");
  });

  it("handles negative values under -1B", () => {
    expect(formatMillions(-500)).toBe("$-500.0M");
  });

  it("handles negative values over -1B magnitude", () => {
    expect(formatMillions(-2000)).toBe("$-2.0B");
  });

  it("formats fractional millions", () => {
    expect(formatMillions(12.567)).toBe("$12.6M");
  });
});

describe("formatPercent", () => {
  it("formats 0.08 as 8.0%", () => {
    expect(formatPercent(0.08)).toBe("8.0%");
  });

  it("formats 0.2 as 20.0%", () => {
    expect(formatPercent(0.2)).toBe("20.0%");
  });

  it("respects decimals parameter", () => {
    expect(formatPercent(0.1234, 2)).toBe("12.34%");
  });

  it("handles zero", () => {
    expect(formatPercent(0)).toBe("0.0%");
  });

  it("handles 100%", () => {
    expect(formatPercent(1.0)).toBe("100.0%");
  });
});

describe("formatMultiple", () => {
  it("formats 2.5 as 2.50x", () => {
    expect(formatMultiple(2.5)).toBe("2.50x");
  });

  it("formats 1.0 as 1.00x", () => {
    expect(formatMultiple(1)).toBe("1.00x");
  });

  it("formats 0 as 0.00x", () => {
    expect(formatMultiple(0)).toBe("0.00x");
  });

  it("formats 3.1415 as 3.14x (2 decimal places)", () => {
    expect(formatMultiple(3.1415)).toBe("3.14x");
  });
});

describe("formatIRR", () => {
  it("formats null as N/A", () => {
    expect(formatIRR(null)).toBe("N/A");
  });

  it("formats 0.1487 as 14.9%", () => {
    expect(formatIRR(0.1487)).toBe("14.9%");
  });

  it("formats 0.0 as 0.0%", () => {
    expect(formatIRR(0)).toBe("0.0%");
  });

  it("formats negative IRR correctly", () => {
    expect(formatIRR(-0.05)).toBe("-5.0%");
  });
});

describe("formatDollar", () => {
  it("delegates to formatMillions", () => {
    expect(formatDollar(100)).toBe(formatMillions(100));
    expect(formatDollar(2000)).toBe(formatMillions(2000));
  });
});
