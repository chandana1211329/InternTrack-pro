import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getData, setData, deleteData, getCollectionData } from './fileStorage';

// Initialize Firebase Admin SDK
// Note: You'll need to download a service account key from Firebase Console
// and place it in the backend/src/config/ folder as serviceAccountKey.json
let serviceAccount;

try {
  serviceAccount = JSON.parse(
    readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8')
  );
  console.log('Service account key loaded successfully');
} catch (error) {
  console.warn('Service account key not found. Using file-based database for development.');
  serviceAccount = null;
}

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
  } else {
    // File-based Firebase for development without billing/emulator
    admin.initializeApp({
      projectId: 'interntrack-dev',
    });
    console.log('Firebase Admin initialized with file-based storage');
  }
}

// File-based Firestore implementation
const fileFirestore = {
  collection: (name: string) => {
    const baseQuery = {
      where: (field: string, op: string, value: any) => {
        const filteredData = getCollectionData(name).filter(data => data[field] === value);
        return {
          get: async () => {
            const results = filteredData.map(data => ({ 
              data: () => data,
              id: data.id
            }));
            return Promise.resolve({ 
              docs: results,
              empty: results.length === 0
            });
          },
          where: (field2: string, op2: string, value2: any) => {
            const doubleFiltered = filteredData.filter(data => data[field2] === value2);
            return {
              get: async () => {
                const results = doubleFiltered.map(data => ({ 
                  data: () => data,
                  id: data.id
                }));
                return Promise.resolve({ 
                  docs: results,
                  empty: results.length === 0
                });
              },
              orderBy: (orderByField: string, direction?: string) => ({
                get: async () => {
                  const results = doubleFiltered
                    .sort((a, b) => {
                      if (direction === 'desc') {
                        return b[orderByField] > a[orderByField] ? 1 : -1;
                      }
                      return a[orderByField] > b[orderByField] ? 1 : -1;
                    })
                    .map(data => ({ 
                      data: () => data,
                      id: data.id
                    }));
                  return Promise.resolve({ 
                    docs: results,
                    empty: results.length === 0
                  });
                },
                limit: (limit: number) => ({
                  get: async () => {
                    const results = doubleFiltered
                      .sort((a, b) => {
                        if (direction === 'desc') {
                          return b[orderByField] > a[orderByField] ? 1 : -1;
                        }
                        return a[orderByField] > b[orderByField] ? 1 : -1;
                      })
                      .slice(0, limit)
                      .map(data => ({ 
                        data: () => data,
                        id: data.id
                      }));
                    return Promise.resolve({ 
                      docs: results,
                      empty: results.length === 0
                    });
                  }
                })
              }),
              limit: (limit: number) => ({
                get: async () => {
                  const results = doubleFiltered
                    .slice(0, limit)
                    .map(data => ({ 
                      data: () => data,
                      id: data.id
                    }));
                  return Promise.resolve({ 
                    docs: results,
                    empty: results.length === 0
                  });
                }
              })
            };
          },
          orderBy: (orderByField: string, direction?: string) => ({
            get: async () => {
              const results = filteredData
                .sort((a, b) => {
                  if (direction === 'desc') {
                    return b[orderByField] > a[orderByField] ? 1 : -1;
                  }
                  return a[orderByField] > b[orderByField] ? 1 : -1;
                })
                .map(data => ({ 
                  data: () => data,
                  id: data.id
                }));
              return Promise.resolve({ 
                docs: results,
                empty: results.length === 0
              });
            },
            limit: (limit: number) => ({
              get: async () => {
                const results = filteredData
                  .sort((a, b) => {
                    if (direction === 'desc') {
                      return b[orderByField] > a[orderByField] ? 1 : -1;
                    }
                    return a[orderByField] > b[orderByField] ? 1 : -1;
                  })
                  .slice(0, limit)
                  .map(data => ({ 
                    data: () => data,
                    id: data.id
                  }));
                return Promise.resolve({ 
                  docs: results,
                  empty: results.length === 0
                });
              }
            })
          }),
          limit: (limit: number) => ({
            get: async () => {
              const results = filteredData
                .slice(0, limit)
                .map(data => ({ 
                  data: () => data,
                  id: data.id
                }));
              return Promise.resolve({ 
                docs: results,
                empty: results.length === 0
              });
            }
          })
        };
      },
      orderBy: (field: string, direction?: string) => {
        const sortedData = getCollectionData(name).sort((a, b) => {
          if (direction === 'desc') {
            return b[field] > a[field] ? 1 : -1;
          }
          return a[field] > b[field] ? 1 : -1;
        });
        return {
          get: async () => {
            const results = sortedData.map(data => ({ 
              data: () => data,
              id: data.id
            }));
            return Promise.resolve({ 
              docs: results,
              empty: results.length === 0
            });
          },
          where: (field2: string, op2: string, value2: any) => {
            const filteredSorted = sortedData.filter(data => data[field2] === value2);
            return {
              get: async () => {
                const results = filteredSorted.map(data => ({ 
                  data: () => data,
                  id: data.id
                }));
                return Promise.resolve({ 
                  docs: results,
                  empty: results.length === 0
                });
              },
              limit: (limit: number) => ({
                get: async () => {
                  const results = filteredSorted
                    .slice(0, limit)
                    .map(data => ({ 
                      data: () => data,
                      id: data.id
                    }));
                  return Promise.resolve({ 
                    docs: results,
                    empty: results.length === 0
                  });
                }
              })
            };
          },
          limit: (limit: number) => ({
            get: async () => {
              const results = sortedData
                .slice(0, limit)
                .map(data => ({ 
                  data: () => data,
                  id: data.id
                }));
              return Promise.resolve({ 
                docs: results,
                empty: results.length === 0
              });
            }
          })
        };
      },
      get: async () => {
        const results = getCollectionData(name).map(data => ({ 
          data: () => data,
          id: data.id
        }));
        return Promise.resolve({ 
          docs: results,
          empty: results.length === 0
        });
      },
      doc: (id: string) => ({
        set: async (data: any) => {
          const key = `${name}/${id}`;
          setData(key, { ...data, id });
          return Promise.resolve();
        },
        get: async () => {
          const key = `${name}/${id}`;
          const data = getData(key);
          return Promise.resolve({ 
            exists: !!data, 
            data: () => data,
            id: id
          });
        },
        update: async (data: any) => {
          const key = `${name}/${id}`;
          const existing = getData(key) || {};
          setData(key, { ...existing, ...data });
          return Promise.resolve();
        },
        delete: async () => {
          const key = `${name}/${id}`;
          deleteData(key);
          return Promise.resolve();
        }
      }),
      add: async (data: any) => {
        const id = Math.random().toString(36).substr(2, 9);
        const key = `${name}/${id}`;
        setData(key, { ...data, id });
        return Promise.resolve({ id });
      }
    };
    return baseQuery;
  }
};

export const db = serviceAccount ? admin.firestore() : fileFirestore;
export const auth = admin.auth();

export default admin;
