import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "./Table";

const ROWS = [
  { name: "main → production", runs: 128 },
  { name: "feat/animated-background", runs: 42 },
  { name: "chore/deps", runs: 7 },
];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Table (density)",
    columns: ["default", "dense"],
    rows: ["plain", "numeric", "hover"],
    fastNoIsolation: true,
    component: (column, row) => (
      <div style={{ width: "22rem" }}>
        <TableContainer>
          <Table density={column === "dense" ? "dense" : undefined}>
            <TableHead>
              <TableRow>
                <TableCell head>Branch</TableCell>
                <TableCell head numeric={row === "numeric"}>
                  Runs
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ROWS.map((entry) => (
                <TableRow key={entry.name} hover={row === "hover"}>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell numeric={row === "numeric"}>{entry.runs}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    ),
  });
});

test("should render a semantic table structure", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <TableContainer stickyHeader>
      <Table density="dense">
        <TableHead>
          <TableRow>
            <TableCell head>Name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow hover>
            <TableCell numeric>42</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>,
  );

  // ASSERT — the container is the component root; the table sits inside it.
  await expect(component).toHaveClass(/okkly-table-container--sticky/);
  await expect(component.getByRole("table")).toHaveClass(/okkly-table--dense/);
  await expect(component.getByRole("columnheader", { name: "Name" })).toHaveClass(
    /okkly-table__cell--head/,
  );
  await expect(component.getByRole("cell", { name: "42" })).toHaveClass(
    /okkly-table__cell--numeric/,
  );
  await expect(component.locator(".okkly-table__row--hover")).toBeAttached();
});

test("should render the default table without a density modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Table>
      <TableBody>
        <TableRow>
          <TableCell>A</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-table/);
  await expect(component).not.toHaveClass(/okkly-table--dense/);
});
