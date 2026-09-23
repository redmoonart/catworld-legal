import { Component } from "react";

export default class WebGLErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn("Hero 3D scene failed, falling back to 2D art:", error);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
