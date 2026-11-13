import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ChunkErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ChunkErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches dynamic-import failures or unexpected runtime errors inside lazy routes
 * so students can recover cleanly without hitting a blank white screen.
 */
export class ChunkErrorBoundary extends Component<
  ChunkErrorBoundaryProps,
  ChunkErrorBoundaryState
> {
  state: ChunkErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ChunkErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Error UI provides explicit reload recovery
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-center shadow-xs">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-700">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-sm font-extrabold text-stone-900">
            {this.props.fallbackTitle ?? 'Không tải được giao diện vừa mở'}
          </h3>
          <p className="mt-1 text-xs text-stone-600">
            Có thể mạng vừa gián đoạn hoặc hệ thống vừa cập nhật phiên bản mới. Dữ liệu đã lưu của bạn vẫn an toàn.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-700 px-4 py-2 text-xs font-extrabold text-white hover:bg-red-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
