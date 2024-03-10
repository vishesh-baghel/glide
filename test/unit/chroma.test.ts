import { ChromaClient } from "chromadb";
import { connectChromaDB } from "../../src/db/connections/chroma";

jest.mock("getProbotInstance", () => {
  let mockLogInfo = jest.fn();
  let mockLogError = jest.fn();

  const mockApp = {
    log: {
      info: mockLogInfo,
      error: mockLogError,
    },
  };
  return mockApp;
});

jest.mock("chromadb", () => ({
  ChromaClient: jest.fn(() => ({
    heartbeat: jest.fn(),
    createCollection: jest.fn(),
  })),
}));

describe("connectChromaDB", () => {
  let mockLogInfo = jest.fn();
  // let mockLogError = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should connect to chromadb successfully", async () => {
    await connectChromaDB();
    expect(ChromaClient).toHaveBeenCalled();
    expect(mockLogInfo).toHaveBeenCalled();
  });
});
