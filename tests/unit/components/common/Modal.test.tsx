import Modal from '@/components/common/Modal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Modal', () => {
  it('isOpenがtrueの時に表示される', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>モーダルの内容</p>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('モーダルの内容')).toBeInTheDocument();
  });

  it('isOpenがfalseの時に表示されない', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <p>モーダルの内容</p>
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('タイトルが表示される', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="テストタイトル">
        <p>モーダルの内容</p>
      </Modal>
    );

    expect(screen.getByText('テストタイトル')).toBeInTheDocument();
  });

  it('閉じるボタンをクリックするとonCloseが呼ばれる', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="テスト">
        <p>内容</p>
      </Modal>
    );

    const closeButton = screen.getByLabelText('閉じる');
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('オーバーレイをクリックするとonCloseが呼ばれる', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>内容</p>
      </Modal>
    );

    const overlay = screen.getByRole('dialog');
    await user.click(overlay);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('モーダル内部をクリックしてもonCloseが呼ばれない', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>内容</p>
      </Modal>
    );

    const content = screen.getByText('内容');
    await user.click(content);

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('Escapeキーを押すとonCloseが呼ばれる', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>内容</p>
      </Modal>
    );

    await user.keyboard('{Escape}');

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
