import { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function TokenDebugPage() {
  const [tokens, setTokens] = useState({});
  const [decoded, setDecoded] = useState({});

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = () => {
    const userToken = localStorage.getItem("userToken");
    const authToken = localStorage.getItem("authToken");

    setTokens({ userToken, authToken });

    // Decode tokens (simple base64 decode of JWT payload)
    const decodeToken = (token) => {
      if (!token) return null;
      try {
        const parts = token.split(".");
        if (parts.length !== 3) return { error: "Invalid JWT format" };
        const payload = JSON.parse(atob(parts[1]));
        return payload;
      } catch (error) {
        return { error: error.message };
      }
    };

    setDecoded({
      userToken: decodeToken(userToken),
      authToken: decodeToken(authToken),
    });
  };

  const clearToken = (key) => {
    localStorage.removeItem(key);
    loadTokens();
  };

  const clearAllTokens = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("authToken");
    loadTokens();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Token Debug Information
        </h1>

        <div className="space-y-6">
          {/* User Token */}
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Customer Token (userToken)
              </h2>
              {tokens.userToken && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearToken("userToken")}
                >
                  Clear
                </Button>
              )}
            </div>

            {tokens.userToken ? (
              <>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Token (first 50 chars):
                  </p>
                  <code className="block p-2 bg-gray-100 rounded text-xs break-all">
                    {tokens.userToken.substring(0, 50)}...
                  </code>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Decoded Payload:
                  </p>
                  <pre className="p-4 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(decoded.userToken, null, 2)}
                  </pre>
                </div>

                {decoded.userToken && !decoded.userToken.type && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm font-medium text-red-800">
                      ⚠️ Warning: This token doesn't have a "type" field!
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      Customer tokens should have type: "customer". This might
                      be an admin token stored incorrectly.
                    </p>
                  </div>
                )}

                {decoded.userToken?.type &&
                  decoded.userToken.type !== "customer" && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm font-medium text-red-800">
                        ⚠️ Warning: Wrong token type: {decoded.userToken.type}
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        Expected type: "customer"
                      </p>
                    </div>
                  )}
              </>
            ) : (
              <p className="text-gray-500">No customer token found</p>
            )}
          </Card>

          {/* Admin Token */}
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Admin Token (authToken)
              </h2>
              {tokens.authToken && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearToken("authToken")}
                >
                  Clear
                </Button>
              )}
            </div>

            {tokens.authToken ? (
              <>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Token (first 50 chars):
                  </p>
                  <code className="block p-2 bg-gray-100 rounded text-xs break-all">
                    {tokens.authToken.substring(0, 50)}...
                  </code>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Decoded Payload:
                  </p>
                  <pre className="p-4 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(decoded.authToken, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <p className="text-gray-500">No admin token found</p>
            )}
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Actions
            </h2>
            <div className="space-y-3">
              <Button variant="outline" onClick={loadTokens} className="w-full">
                Refresh Token Info
              </Button>
              <Button
                variant="danger"
                onClick={clearAllTokens}
                className="w-full"
              >
                Clear All Tokens & Go Home
              </Button>
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              💡 How to Fix "Invalid token type" Error
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>
                If userToken doesn't have type: "customer", clear it using the
                button above
              </li>
              <li>Go to the login page and sign in with a customer account</li>
              <li>
                The new token will have the correct type: "customer" field
              </li>
              <li>
                Admin tokens (authToken) don't have a type field - this is
                normal
              </li>
              <li>Don't login to admin panel using the customer login page</li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
