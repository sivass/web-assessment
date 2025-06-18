import React from "react";
import { render, screen, } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Navbar from "../index";

// Mock Next.js navigation
const mockPush = jest.fn();
const mockPathname = "/";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

// Mock auth utilities
jest.mock("@/lib/auth", () => ({
  getAuthToken: jest.fn(),
  removeAuthToken: jest.fn(),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  LogOut: () => <div data-testid="logout-icon">LogOut</div>,
}));

describe("Navbar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the navbar with logo", () => {
      render(<Navbar />);
      const logoElements = screen.getAllByText("AEON");
      expect(logoElements).toHaveLength(2); // One for mobile, one for desktop
      expect(logoElements[0]).toBeInTheDocument();
    });

    it("renders all navigation items", () => {
      render(<Navbar />);
      const navItems = [
        "Showcase",
        "Docs",
        "Blog",
        "Analytics",
        "Templates",
        "Enterprise",
      ];

      navItems.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it("renders search input", () => {
      render(<Navbar />);
      expect(
        screen.getByPlaceholderText("Search documentation...")
      ).toBeInTheDocument();
    });
  });

  describe("Mobile Menu", () => {
    it("shows hamburger menu on mobile", () => {
      render(<Navbar />);
      expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
    });

    it("toggles mobile menu when hamburger is clicked", async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const menuButton = screen.getByLabelText("Toggle menu");

      // Initially menu should be closed
      expect(
        screen.queryByPlaceholderText("Search...")
      ).not.toBeInTheDocument();

      // Click to open menu
      await user.click(menuButton);

      // Menu should now be open
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();

      // Click to close menu
      await user.click(menuButton);

      // Menu should be closed again
      expect(
        screen.queryByPlaceholderText("Search...")
      ).not.toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("allows typing in search input", async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const searchInput = screen.getByPlaceholderText(
        "Search documentation..."
      );
      await user.type(searchInput, "test search");

      expect(searchInput).toHaveValue("test search");
    });
  });

  describe("Navigation Links", () => {
    it("renders all navigation links with correct hrefs", () => {
      render(<Navbar />);

      const navItems = [
        { name: "Showcase", href: "#" },
        { name: "Docs", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Analytics", href: "#" },
        { name: "Templates", href: "#" },
        { name: "Enterprise", href: "#" },
      ];

      navItems.forEach((item) => {
        const link = screen.getByText(item.name);
        expect(link).toHaveAttribute("href", item.href);
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-label for menu toggle button", () => {
      render(<Navbar />);
      expect(screen.getByLabelText("Toggle menu")).toBeInTheDocument();
    });

    it("has proper form elements", () => {
      render(<Navbar />);
      expect(
        screen.getByPlaceholderText("Search documentation...")
      ).toHaveAttribute("type", "text");
    });
  });
});
