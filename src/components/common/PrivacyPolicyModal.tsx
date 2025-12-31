'use client';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * プライバシーポリシー表示モーダルコンポーネント
 */
export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800"
        onClick={(event) => event.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            プライバシーポリシー
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label="閉じる"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: 'calc(80vh - 140px)' }}>
          <div className="prose prose-sm max-w-none">
            {/* 必須同意項目 */}
            <section className="mb-8">
              <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">
                必須同意項目
              </h3>
              <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                本サービスを利用する前に、以下の事項に同意する必要があります。
              </p>

              <div className="mb-4">
                <h4 className="mb-2 text-base font-bold text-gray-900 dark:text-gray-200">
                  サービスの性質
                </h4>
                <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                  <li>
                    <strong>
                      本サービスは個人が開発した非公式ツールであり、LINE株式会社およびLINEヤフー株式会社とは一切関係がありません。
                    </strong>
                  </li>
                  <li>
                    LINEの公式サービスではなく、LINE社の承認・推奨を受けたものではありません。
                  </li>
                  <li>
                    「LINE」の名称は、LINEアプリのトーク履歴を解析対象とすることを説明する目的でのみ使用しています。
                  </li>
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="mb-2 text-base font-bold text-gray-900 dark:text-gray-200">
                  免責事項
                </h4>
                <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                  本サービスの利用に関して、以下の点をご了承ください：
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                  <li>
                    <strong>
                      本サービスは「現状有姿」で提供され、明示・黙示を問わず、いかなる保証も行いません。
                    </strong>
                  </li>
                  <li>
                    本サービスの利用により生じた直接的・間接的な損害について、開発者は一切の責任を負いません。
                  </li>
                  <li>データの紛失、漏洩、破損等が発生した場合でも、開発者は責任を負いません。</li>
                  <li>サービスの中断、終了、変更について、事前の通知なく行う場合があります。</li>
                  <li>解析結果の正確性は保証されません。</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 text-base font-bold text-gray-900 dark:text-gray-200">
                  利用条件
                </h4>
                <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                  <li>
                    上記の「サービスの性質」および「免責事項」に同意した場合のみ、本サービスを利用できます。
                  </li>
                  <li>
                    <strong>同意しない場合は、本サービスを利用することはできません。</strong>
                  </li>
                  <li>未成年の方は、保護者の同意を得た上でご利用ください。</li>
                </ul>
              </div>
            </section>

            {/* データの取り扱い */}
            <section className="mb-8">
              <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">
                データの取り扱い
              </h3>

              <div className="mb-4">
                <h4 className="mb-2 text-base font-bold text-gray-900 dark:text-gray-200">
                  サーバー側での処理
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300 text-sm dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="border border-gray-300 px-3 py-2 text-left dark:border-gray-600 dark:text-gray-200">
                          項目
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left dark:border-gray-600 dark:text-gray-200">
                          内容
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          ファイルの保存
                        </td>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          しない（ディスクに書き込まない）
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          データベースへの保存
                        </td>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          しない（DBを使用しない）
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          メモリ上での処理
                        </td>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          解析処理中のみ一時的に保持
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          解析後のデータ
                        </td>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          即座にメモリから破棄
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          アクセスログ
                        </td>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          IPアドレス・時刻のみ記録（トーク内容は記録しない）
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          第三者への提供
                        </td>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          一切行わない
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="mb-2 text-base font-bold text-gray-900 dark:text-gray-200">
                  通信の保護
                </h4>
                <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                  <li>
                    <strong>HTTPS（TLS 1.2以上）</strong> による暗号化通信
                  </li>
                  <li>ファイル内容は暗号化された状態で送信</li>
                  <li>通信経路上での盗聴を防止</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 text-base font-bold text-gray-900 dark:text-gray-200">
                  フロントエンド側での処理
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300 text-sm dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="border border-gray-300 px-3 py-2 text-left dark:border-gray-600 dark:text-gray-200">
                          項目
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left dark:border-gray-600 dark:text-gray-200">
                          内容
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          LocalStorage
                        </td>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          トーク内容を保存しない
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          Cookie
                        </td>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          トーク内容を保存しない
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          解析結果の保持
                        </td>
                        <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                          ブラウザのメモリ上のみ（ページ離脱で消去）
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 推奨事項 */}
            <section className="mb-8">
              <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">推奨事項</h3>
              <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                より安心してご利用いただくために、以下を推奨します：
              </p>

              <div className="space-y-3">
                <div>
                  <h4 className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-200">
                    1. プライベートブラウジング（シークレットモード）の使用
                  </h4>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                    <li>ブラウザの履歴に残らない</li>
                    <li>セッション終了後、一時データが自動削除される</li>
                    <li>共有端末での利用時に特に有効</li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-200">
                    2. 解析後の操作
                  </h4>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                    <li>結果確認後、ブラウザのタブを閉じることでメモリ上のデータも消去</li>
                    <li>必要に応じてブラウザの履歴を削除</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* データ処理の透明性 */}
            <section className="mb-8">
              <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">
                データ処理の透明性
              </h3>
              <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                本サービスはオープンソースで開発されており、処理内容を誰でも確認できます。
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="border border-gray-300 px-3 py-2 text-left dark:border-gray-600 dark:text-gray-200">
                        リポジトリ
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left dark:border-gray-600 dark:text-gray-200">
                        説明
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                        <a
                          href="https://github.com/Kubo-Tech/line_talk_analyzer_frontend"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          line_talk_analyzer_frontend
                        </a>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                        フロントエンド
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                        <a
                          href="https://github.com/Kubo-Tech/line_talk_analyzer_backend"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          line_talk_analyzer_backend
                        </a>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-gray-300">
                        バックエンド
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Cookie・ローカルストレージ */}
            <section className="mb-8">
              <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">
                Cookie・ローカルストレージ
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                本サービスは、機能向上のためにCookieやローカルストレージを使用する場合があります。個人を特定できる情報は保存されません。
              </p>
            </section>

            {/* プライバシーポリシーの変更 */}
            <section className="mb-8">
              <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">
                プライバシーポリシーの変更
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                本ポリシーは予告なく変更される場合があります。重要な変更がある場合は、サービス上で通知します。
              </p>
            </section>

            {/* お問い合わせ */}
            <section>
              <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">
                お問い合わせ
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                本ポリシーに関するお問い合わせは、GitHubリポジトリのIssuesにてお願いします。
              </p>
            </section>
          </div>
        </div>

        {/* フッター */}
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
