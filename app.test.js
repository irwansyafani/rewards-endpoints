const request = require("supertest");
const { server } = require("./app");

describe("Calling APIs", () => {
  afterAll((done) => {
    server.close(done);
  });
  const CURRENT_DATE = new Date().toISOString();

  it("GET - should return data (initialization)", async () => {
    const response = await request(server).get(
      `/users/1/rewards?at=${CURRENT_DATE}`
    );
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text)).toHaveLength(7);
  });
  it("GET - should return data (existing)", async () => {
    const response = await request(server).get(
      `/users/1/rewards?at=${CURRENT_DATE}`
    );
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text)).toHaveLength(7);
  });
  it("GET - should return data (with initiate new dates)", async () => {
    const mockDate = new Date();
    mockDate.setDate(mockDate.getDate() + 8);
    const response = await request(server).get(
      `/users/1/rewards?at=${mockDate.toISOString()}`
    );
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text)).toHaveLength(7);
  });

  it("GET - should return error invalid date", async () => {
    const response = await request(server).get(
      "/users/1/rewards?at=gchgvjhvjkkh"
    );
    expect(response.status).toBe(400);
    expect(response.text).toBeDefined();
    expect(JSON.parse(response.text).error.message).toBe(
      "date is not valid format"
    );
  });

  it("PATCH - should return data", async () => {
    const response = await request(server).patch(
      `/users/1/rewards/${CURRENT_DATE}/redeem`
    );
    const responseBody = JSON.parse(response.text);
    expect(response.status).toBe(200);
    expect(responseBody).toBeDefined();
    expect(responseBody.redeemedAt).toBeDefined();
  });

  it("PATCH - should return error after called once", async () => {
    const response = await request(server).patch(
      `/users/1/rewards/${CURRENT_DATE}/redeem`
    );
    const responseBody = JSON.parse(response.text);
    expect(response.status).toBe(400);
    expect(responseBody).toBeDefined();
    expect(responseBody.error.message).toBe("This reward is already expired");
  });

  it("PATCH - should return error when called it out of date range", async () => {
    const mockDate = new Date();
    mockDate.setDate(1);
    mockDate.setMonth(3);
    const response = await request(server).patch(
      `/users/1/rewards/${mockDate.toISOString()}/redeem`
    );
    const responseBody = JSON.parse(response.text);
    expect(response.status).toBe(400);
    expect(responseBody).toBeDefined();
    expect(responseBody.error.message).toBe("This reward is already expired");
  });

  it("PATCH - should return error", async () => {
    const response = await request(server).patch(
      `/users/1/rewards/kadjflaksdkl/redeem`
    );
    const responseBody = JSON.parse(response.text);
    expect(response.status).toBe(400);
    expect(responseBody).toBeDefined();
    expect(responseBody.error.message).toBe("can't process your request");
  });
});
